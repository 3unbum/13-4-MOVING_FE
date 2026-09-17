"use client";

import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/common/Button";
import InputTextArea from "@/components/common/InputTextarea";
import InputTextField from "@/components/common/InputTextfield";
import ProfileImageUpload from "@/components/common/ProfileImageUpload";
import Toast from "@/components/common/Toast";
import Chip from "@/components/filter/ChipRegion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import FieldLabel from "@/components/profile/FieldLabel";
import { REGION_OPTIONS, SERVICE_OPTIONS } from "@/constants/profile/options";
import { moverProfileSchema, type MoverProfileFormValues } from "@/lib/schemas/profile-schema";
import { profileService } from "@/lib/services/profile-service";
import type { MoverAccountResponse } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/utils/api-error";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";

const PC_QUERY = "(min-width: 1280px)";

interface MoverProfileEditFormProps {
  account: MoverAccountResponse;
  // 성공적으로 저장되면 부모(MoverProfileEditPanel)의 계정 상태를 갱신 — 별도 재조회 없이
  // 이 화면에서 받은 응답을 그대로 올려보낸다
  onAccountUpdated: (account: MoverAccountResponse) => void;
}

// 피그마 "마이페이지_프로필 수정_기사님" 대응(#73). 필드 구성(별명/경력/한줄소개/상세설명/
// 서비스/지역)이 등록 폼(MoverProfileForm, "프로필 등록_기사님")과 완전히 동일해서 같은
// moverProfileSchema를 그대로 재사용한다 — hasProfile 게이트를 통과한 뒤에만 오는 화면이라
// "비워서 지우기"는 지원하지 않고(등록 때와 동일하게 전부 상시 필수), 계정에 있는 값으로 프리필만 다르다.
function accountToFormValues(account: MoverAccountResponse): MoverProfileFormValues {
  return {
    image: account.image ?? undefined,
    nickName: account.nickName ?? "",
    career: account.career ?? 0,
    bio: account.bio ?? "",
    description: account.description ?? "",
    services: account.services,
    regions: account.regions,
  };
}

export default function MoverProfileEditForm({
  account,
  onAccountUpdated,
}: MoverProfileEditFormProps) {
  const { refetch } = useAuth();
  const [submitError, setSubmitError] = useState<string>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // ProfileImageUpload가 서버 업로드 중일 때는 제출을 막아야 함 — onChange가 업로드 완료 후에만
  // 호출되므로, 업로드 중 제출하면 새 이미지 URL이 반영되기 전에 폼이 전송될 수 있다
  const [isImageUploading, setIsImageUploading] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);
  // PC에서만 필드를 md 크기로 키움 (CustomerProfileEditForm과 동일 패턴)
  const isPc = useMediaQuery(PC_QUERY);
  const fieldSize = isPc ? "md" : "sm";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MoverProfileFormValues>({
    resolver: zodResolver(moverProfileSchema),
    // account가 나중에(부모의 재조회로) 바뀌면 RHF가 그 시점에 폼을 다시 리셋해준다 —
    // defaultValues는 최초 렌더 시점 값으로 고정돼서 이 케이스엔 안 맞음 (CustomerProfileEditForm과 동일 패턴)
    values: accountToFormValues(account),
  });

  // watch()는 리렌더마다 새 함수 참조를 반환해 React Compiler가 메모이제이션을 못 함(lint 경고) —
  // useWatch는 구독 기반이라 이 문제가 없음
  const selectedServices = useWatch({ control, name: "services" }) ?? [];
  const selectedRegions = useWatch({ control, name: "regions" }) ?? [];

  function toggle(field: "services" | "regions", value: string) {
    const current = field === "services" ? selectedServices : selectedRegions;
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setValue(field, next, { shouldValidate: true });
  }

  function showToast(message: string) {
    if (toastTimeoutRef.current != null) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => {
      toastTimeoutRef.current = null;
      setToastMessage(null);
    }, 3000);
  }

  async function onSubmit(values: MoverProfileFormValues) {
    setSubmitError(undefined);
    try {
      const updated = await profileService.updateMover(values);
      onAccountUpdated(updated);
      // 수정 자체는 끝났으니 refetch 실패를 수정 실패로 취급하지 않는다 — GNB가 못 갱신되더라도
      // 계정 캐시는 다음 새로고침 때 맞춰진다. (#123, CustomerProfileEditForm과 동일 패턴)
      await refetch().catch(() => {});
      showToast("프로필을 수정했어요");
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "프로필 수정에 실패했어요. 잠시 후 다시 시도해주세요"
      );
    }
  }

  return (
    // handleSubmit(onSubmit)을 JSX 속성 위치에서 직접 호출하면 react-compiler eslint가
    // "렌더 중 ref 접근 가능성"으로 오탐한다(onSubmit이 toastTimeoutRef를 참조하는 showToast를
    // 부르기 때문) — 이벤트 핸들러 경계 안에서 호출하도록 한 겹 감싸서 우회한다.
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      // 컨텐츠(그리드)-버튼 간격: 피그마 실측 모바일/태블릿 32px(gap-8), 데스크톱 48px(pc:gap-12,
      // 기존값 유지) — #73 재확인(2026-09-17)
      className="pc:gap-12 flex w-full flex-col gap-8"
    >
      <div className="pc:grid pc:grid-cols-2 pc:items-start pc:gap-x-30 pc:gap-y-8 flex flex-col gap-5">
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

          {/* 프로필이미지-별명 사이 구분선은 데스크톱에만 있음(피그마 Desktop) — 태블릿/모바일은
              바로 이어짐(피그마 Tablet/Mobile, 이 구분선 없이 20px 간격만 있음) */}
          <div className="bg-line-100 pc:block hidden h-px w-full" />

          <div className="flex flex-col gap-4">
            <FieldLabel>별명</FieldLabel>
            <InputTextField
              label="별명"
              placeholder="사이트에 노출될 별명을 입력해 주세요"
              size={fieldSize}
              errorMessage={errors.nickName?.message}
              {...register("nickName")}
            />
          </div>

          <div className="bg-line-100 h-px w-full" />

          <div className="flex flex-col gap-4">
            <FieldLabel>경력</FieldLabel>
            <InputTextField
              label="경력"
              type="text"
              inputMode="numeric"
              placeholder="기사님의 경력을 입력해 주세요"
              size={fieldSize}
              errorMessage={errors.career?.message}
              // inputMode="numeric"은 키패드 힌트일 뿐 실제 입력을 막지 않음 — "1년"처럼 문자가
              // 섞이거나, "1e5"처럼 Number()가 그대로 통과시켜버리는(=100000, int().min(0) 우회) 값이
              // 들어올 수 있어 입력 단계에서 숫자 이외 문자를 바로 제거해야 함 (등록 폼과 동일 컨벤션)
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
              }}
              {...register("career", {
                setValueAs: (v) => {
                  if (v == null || (typeof v === "string" && v.trim() === "")) {
                    return undefined;
                  }
                  const number = Number(v);
                  return Number.isNaN(number) ? undefined : number;
                },
              })}
            />
          </div>

          <div className="bg-line-100 h-px w-full" />

          <div className="flex flex-col gap-4">
            <FieldLabel>한 줄 소개</FieldLabel>
            <InputTextField
              label="한 줄 소개"
              placeholder="한 줄 소개를 입력해 주세요"
              size={fieldSize}
              errorMessage={errors.bio?.message}
              {...register("bio")}
            />
          </div>
        </div>

        {/* 데스크톱은 두 컬럼이 나란히 배치돼 구분선이 없지만(피그마 Desktop), 모바일/태블릿은 세로로
            쌓이면서 한 줄 소개-상세 설명 사이에 구분선이 있음(피그마 Tablet/Mobile) — pc에서만 숨김 */}
        <div className="pc:hidden bg-line-100 h-px w-full" />

        <div className="pc:gap-8 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <FieldLabel>상세 설명</FieldLabel>
            <InputTextArea
              label="상세 설명"
              placeholder="상세 내용을 입력해 주세요"
              size={fieldSize}
              errorMessage={errors.description?.message}
              {...register("description")}
            />
          </div>

          <div className="bg-line-100 h-px w-full" />

          <div className="flex flex-col gap-4">
            <FieldLabel>제공 서비스</FieldLabel>
            <div className="pc:gap-3 flex flex-wrap gap-1.5">
              {SERVICE_OPTIONS.map((option) => {
                const selected = selectedServices.includes(option.value);
                return (
                  <Chip
                    key={option.value}
                    size="sm"
                    selected={selected}
                    onClick={() => toggle("services", option.value)}
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

          <div className="flex flex-col gap-4">
            <FieldLabel>서비스 가능 지역</FieldLabel>
            <div className="pc:gap-4 flex flex-wrap gap-2">
              {REGION_OPTIONS.map((option) => {
                const selected = selectedRegions.includes(option.value);
                return (
                  <Chip
                    key={option.value}
                    size="sm"
                    selected={selected}
                    onClick={() => toggle("regions", option.value)}
                    className={cn("pc:px-5 pc:py-2.5 pc:text-18", !selected && "pc:font-normal")}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </div>
            {errors.regions && (
              <p className="text-13 font-medium text-red-200">{errors.regions.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 버튼 줄: 취소(240px)+수정하기(240px)+20px 간격, 오른쪽 정렬 — CustomerProfileEditForm과
          동일 패턴. "취소"는 여기선 페이지 이동이 아니라 폼을 마지막 저장 값으로 되돌리는 동작 —
          마이페이지(/mover/mypage) 쪽 "취소 시 복귀" 동작이 아직 스펙으로 정해진 게 없어(PR #132
          머지 전) 일단 폼 리셋으로만 둔다. 확정되면 router.push("/mover/mypage")로 바꿀 수 있음. */}
      <div className="pc:w-125 pc:self-end w-full">
        <div className="pc:flex-row pc:gap-5 flex w-full flex-col-reverse gap-2">
          <div className="pc:w-60">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              className="pc:h-15 pc:rounded-2xl pc:text-18"
              onClick={() => reset(accountToFormValues(account))}
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
      {toastMessage && <Toast message={toastMessage} />}
    </form>
  );
}
