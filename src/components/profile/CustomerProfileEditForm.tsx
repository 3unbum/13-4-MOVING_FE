"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/common/Button";
import FormField from "@/components/auth/FormField";
import ProfileImageUpload from "@/components/common/ProfileImageUpload";
import Toast from "@/components/common/Toast";
import Chip from "@/components/filter/ChipRegion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { REGION_OPTIONS, SERVICE_OPTIONS } from "@/constants/profile/options";
import {
  customerProfileUpdateSchema,
  type CustomerProfileUpdateFormValues,
} from "@/lib/schemas/profile-schema";
import { profileService } from "@/lib/services/profile-service";
import type { CustomerAccountResponse } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/utils/api-error";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";

interface CustomerProfileEditFormProps {
  // 서버 컴포넌트(page.tsx)의 requireRole 결과를 그대로 재사용 — /profiles/customer GET과
  // /auth/me 응답 타입이 동일(CustomerAccountResponse)해서 별도 조회 없이 이 값으로 폼을 채운다.
  // null은 accessToken 만료 직후 fail-open 구간(guards.ts 주석 참고)뿐이라, 그때만 아래에서
  // 클라이언트가 직접 한 번 더 조회한다.
  initialAccount: CustomerAccountResponse | null;
}

const PC_QUERY = "(min-width: 1280px)";

function accountToFormValues(account: CustomerAccountResponse): CustomerProfileUpdateFormValues {
  return {
    name: account.name,
    phoneNumber: account.phoneNumber,
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
    image: account.image ?? undefined,
    // hasProfile 게이트를 통과한 뒤에만 오는 페이지라 region/services는 항상 값이 있다고 가정
    // (register 단계에서 이미 필수로 채워짐)
    region: account.region as CustomerProfileUpdateFormValues["region"],
    services: account.services as CustomerProfileUpdateFormValues["services"],
  };
}

export default function CustomerProfileEditForm({ initialAccount }: CustomerProfileEditFormProps) {
  const router = useRouter();
  const { refetch } = useAuth();
  const [account, setAccount] = useState<CustomerAccountResponse | null>(initialAccount);
  const [isLoadingAccount, setIsLoadingAccount] = useState(!initialAccount);
  const [loadError, setLoadError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [isImageUploading, setIsImageUploading] = useState(false);
  // PC에서만 필드를 md 크기로 키움 (태블릿은 FormField 내부 CSS로 이미 처리됨)
  const isPc = useMediaQuery(PC_QUERY);
  const fieldSize = isPc ? "md" : "sm";

  useEffect(() => {
    if (account) return;
    let active = true;
    profileService
      .getCustomer()
      .then((data) => {
        if (!active) return;
        // 서버 가드(requireProfile)는 requireRole이 fail-open으로 null을 반환하면 건너뛴다 —
        // 그 구간을 여기서 다시 한 번 막는다. 코드래빗 리뷰(PR #124) 지적사항.
        if (!data.hasProfile) {
          router.replace("/customer/profile-register");
          return;
        }
        setAccount(data);
      })
      .catch(() => {
        if (active) setLoadError("계정 정보를 불러오지 못했어요. 새로고침해 주세요");
      })
      .finally(() => {
        if (active) setIsLoadingAccount(false);
      });
    return () => {
      active = false;
    };
  }, [account, router]);

  const formValues = useMemo(() => (account ? accountToFormValues(account) : undefined), [account]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerProfileUpdateFormValues>({
    resolver: zodResolver(customerProfileUpdateSchema),
    // account가 나중에(비동기로) 채워져도 values를 쓰면 RHF가 그 시점에 폼을 다시 리셋해준다 —
    // defaultValues는 최초 렌더 시점 값으로 고정돼서 이 케이스엔 안 맞음
    values: formValues,
  });

  // watch()는 리렌더마다 새 함수 참조를 반환해 React Compiler가 메모이제이션을 못 함(lint 경고) —
  // useWatch는 구독 기반이라 이 문제가 없음 (PR #109 리뷰 코멘트, 프로필 등록 폼과 동일 컨벤션)
  const selectedServices = useWatch({ control, name: "services" }) ?? [];
  const selectedRegion = useWatch({ control, name: "region" });

  function toggleService(value: string) {
    const next = selectedServices.includes(value)
      ? selectedServices.filter((service) => service !== value)
      : [...selectedServices, value];
    setValue("services", next, { shouldValidate: true });
  }

  async function onSubmit(values: CustomerProfileUpdateFormValues) {
    setSubmitError(undefined);
    try {
      await profileService.updateCustomer({
        name: values.name,
        phoneNumber: values.phoneNumber,
        image: values.image,
        region: values.region,
        services: values.services,
        // 비밀번호는 새 비밀번호를 입력했을 때만 실어 보낸다 — 빈 문자열을 보내면 BE 검증(정규식)에 걸림
        ...(values.newPassword && {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      // refetch 실패는 제출 실패로 취급하지 않되, 로그는 남긴다
      await refetch().catch((error) => {
        console.error("프로필 수정 후 계정 정보 갱신에 실패했어요", error);
      });
      router.push("/");
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "프로필 수정에 실패했어요. 잠시 후 다시 시도해주세요"
      );
    }
  }

  if (isLoadingAccount) {
    return <p className="text-14 text-black-100 pc:text-16">불러오는 중...</p>;
  }

  if (!account) {
    return <p className="text-14 pc:text-16 text-red-200">{loadError}</p>;
  }

  return (
    // 피그마 node 1:10192 실측(2026-09-17): 데스크탑에서 [구분선+2열 그리드] 묶음과 [버튼 줄]
    // 사이 간격이 64px(gap-16)이고, 묶음 내부(구분선→그리드)는 40px(gap-10)로 서로 다른 리듬이라
    // 두 단계로 중첩함 — 이전엔 전부 한 레벨(gap-14=56px)로 뭉뚱그려서 중간 간격이 어긋났었음
    <form onSubmit={handleSubmit(onSubmit)} className="pc:gap-16 flex w-full flex-col gap-8">
      <div className="pc:gap-10 flex flex-col gap-5">
        <div className="bg-line-100 h-px w-full" />

        {/* 1120px 콘텐츠를 500px 2열(간격 120px)로 — MoverProfileForm의 pc:gap-x-30과 동일 수치.
            모바일/태블릿은 세로 한 줄로 접힘(register 폼과 동일 패턴) */}
        <div className="pc:grid pc:grid-cols-2 pc:items-start pc:gap-x-30 pc:gap-y-8 flex flex-col gap-5">
          <div className="pc:gap-8 flex flex-col gap-5">
            <FormField
              id="name"
              label="이름"
              type="text"
              size={fieldSize}
              placeholder="이름을 입력해 주세요"
              autoComplete="name"
              errorMessage={errors.name?.message}
              {...register("name")}
            />

            {/* 이메일은 BE customerProfileUpdateSchema에 필드 자체가 없어 이 화면에서 수정 불가 —
                계정 조회 값을 읽기 전용으로만 보여준다 */}
            <FormField
              id="email"
              label="이메일"
              type="email"
              size={fieldSize}
              value={account.email}
              disabled
              readOnly
            />

            <FormField
              id="phoneNumber"
              label="전화번호"
              type="tel"
              size={fieldSize}
              placeholder="하이픈(-) 없이 숫자만 입력해 주세요"
              autoComplete="tel"
              errorMessage={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />

            <hr className="border-line-100" />

            <FormField
              id="currentPassword"
              label="현재 비밀번호"
              type="password"
              size={fieldSize}
              placeholder="현재 비밀번호를 입력해주세요"
              autoComplete="current-password"
              errorMessage={errors.currentPassword?.message}
              {...register("currentPassword")}
            />

            <hr className="border-line-100" />

            <FormField
              id="newPassword"
              label="새 비밀번호"
              type="password"
              size={fieldSize}
              placeholder="새 비밀번호를 입력해주세요"
              autoComplete="new-password"
              errorMessage={errors.newPassword?.message}
              {...register("newPassword")}
            />

            <FormField
              id="newPasswordConfirm"
              label="새 비밀번호 확인"
              type="password"
              size={fieldSize}
              placeholder="새 비밀번호를 다시 한번 입력해주세요"
              autoComplete="new-password"
              errorMessage={errors.newPasswordConfirm?.message}
              {...register("newPasswordConfirm")}
            />
          </div>

          {/* 데스크탑 2열에서는 안 보이지만, 태블릿/모바일에서 한 줄로 이어질 때 계정 정보
              블록과 프로필 이미지 블록 사이에 실제로 구분선이 하나 더 있음(피그마 node 1:10149,
              Vector 2516) — 2열 grid의 3번째 child가 되면 배치가 깨지므로 pc에서만 숨김 */}
          <div className="bg-line-100 pc:hidden h-px w-full" />

          <div className="pc:gap-8 flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <span className="text-16 text-black-black-400 pc:text-20 font-semibold">
                프로필 이미지
              </span>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ProfileImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onUploadingChange={setIsImageUploading}
                  />
                )}
              />
            </div>

            <div className="bg-line-100 h-px w-full" />

            <div className="flex flex-col gap-8">
              <div className="pc:gap-1 flex flex-col gap-2">
                <span className="text-16 text-black-black-400 pc:text-20 font-semibold">
                  이용 서비스
                </span>
                <p className="text-12 text-black-100 pc:text-16">
                  이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
                </p>
              </div>
              <div className="pc:gap-3 flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((option) => {
                  const selected = selectedServices.includes(option.value);
                  return (
                    <Chip
                      key={option.value}
                      size="sm"
                      selected={selected}
                      onClick={() => toggleService(option.value)}
                      className={cn("pc:px-5 pc:py-2.5 pc:text-18", !selected && "pc:font-normal")}
                    >
                      {option.label}
                    </Chip>
                  );
                })}
              </div>
              {errors.services && (
                <p className="text-13 font-medium text-red-200">{errors.services.message}</p>
              )}
            </div>

            <div className="bg-line-100 h-px w-full" />

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-16 text-black-black-400 pc:text-20 font-semibold">
                  내가 사는 지역
                </span>
                <p className="text-12 text-black-100 pc:text-16">
                  내가 사는 지역은 언제든 수정 가능해요!
                </p>
              </div>
              <div className="pc:gap-4 flex flex-wrap gap-2">
                {REGION_OPTIONS.map((option) => {
                  const selected = selectedRegion === option.value;
                  return (
                    <Chip
                      key={option.value}
                      size="sm"
                      selected={selected}
                      onClick={() => setValue("region", option.value, { shouldValidate: true })}
                      className={cn("pc:px-5 pc:py-2.5 pc:text-18", !selected && "pc:font-normal")}
                    >
                      {option.label}
                    </Chip>
                  );
                })}
              </div>
              {errors.region && (
                <p className="text-13 font-medium text-red-200">{errors.region.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 줄: 피그마상 오른쪽 컬럼(500px)과 같은 폭·같은 x좌표에 정렬됨 — MoverProfileForm의
          단일 제출 버튼 래퍼(pc:w-125 pc:self-end)와 동일 패턴. 안쪽은 취소(240px)+수정하기(240px)
          +20px 간격 = 정확히 500px. 모바일/태블릿은 수정하기(위)/취소(아래) 세로 풀폭으로 순서만
          뒤집는다(DOM 순서는 [취소, 수정하기] 그대로 — 포커스 이동 순서를 안 건드리려고) */}
      <div className="pc:w-125 pc:self-end w-full">
        <div className="pc:flex-row pc:gap-5 flex w-full flex-col-reverse gap-2">
          <div className="pc:w-60">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              className="pc:h-15 pc:rounded-2xl pc:text-18"
              onClick={() => {
                // 직접 진입(북마크·새 탭)이면 돌아갈 곳이 없어 빈 화면이 된다 — 랜딩으로 보낸다
                if (window.history.length > 1) router.back();
                else router.replace("/");
              }}
            >
              취소
            </Button>
          </div>
          <div className="pc:w-60">
            <Button
              type="submit"
              size="sm"
              className="pc:h-15 pc:rounded-2xl pc:text-18"
              disabled={isSubmitting || isImageUploading}
            >
              {isSubmitting ? "수정 중..." : "수정하기"}
            </Button>
          </div>
        </div>
      </div>

      {submitError && <Toast message={submitError} />}
    </form>
  );
}
