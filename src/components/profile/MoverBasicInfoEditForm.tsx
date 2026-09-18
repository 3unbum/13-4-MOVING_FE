"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/common/Button";
import InputTextField from "@/components/common/InputTextfield";
import Toast from "@/components/common/Toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import FieldLabel from "@/components/profile/FieldLabel";
import {
  moverBasicInfoUpdateSchema,
  type MoverBasicInfoUpdateFormValues,
} from "@/lib/schemas/profile-schema";
import { profileService } from "@/lib/services/profile-service";
import type { MoverAccountResponse } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/utils/api-error";
import { useAuth } from "@/providers/AuthProvider";

const PC_QUERY = "(min-width: 1280px)";

interface MoverBasicInfoEditFormProps {
  account: MoverAccountResponse;
  onAccountUpdated: (account: MoverAccountResponse) => void;
}

// 피그마 "마이페이지_기본정보 수정_기사님" 대응(#73). 이름/전화번호/비밀번호 변경만 다루고,
// 이메일은 BE moverProfileUpdateSchema에 필드가 없어 읽기 전용으로만 보여준다 — 프로필
// 필드(별명/경력/…)는 별도 화면(MoverProfileEditForm, /mover/mypage/edit)이 맡는다.
function accountToFormValues(account: MoverAccountResponse): MoverBasicInfoUpdateFormValues {
  return {
    name: account.name,
    phoneNumber: account.phoneNumber,
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  };
}

export default function MoverBasicInfoEditForm({
  account,
  onAccountUpdated,
}: MoverBasicInfoEditFormProps) {
  const router = useRouter();
  const { refetch } = useAuth();
  const [submitError, setSubmitError] = useState<string>();
  // PC에서만 필드를 md 크기로 키움 (CustomerProfileEditForm과 동일 패턴)
  const isPc = useMediaQuery(PC_QUERY);
  const fieldSize = isPc ? "md" : "sm";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MoverBasicInfoUpdateFormValues>({
    resolver: zodResolver(moverBasicInfoUpdateSchema),
    // account가 나중에(부모의 재조회로) 바뀌면 RHF가 그 시점에 폼을 다시 리셋해준다 — 비밀번호
    // 필드는 accountToFormValues가 항상 빈 문자열을 돌려주므로 제출 성공 후 자동으로 비워진다.
    values: accountToFormValues(account),
  });

  async function onSubmit(values: MoverBasicInfoUpdateFormValues) {
    setSubmitError(undefined);
    try {
      const updated = await profileService.updateMover({
        name: values.name,
        phoneNumber: values.phoneNumber,
        // 비밀번호는 새 비밀번호를 입력했을 때만 실어 보낸다 — 빈 문자열을 보내면 BE 검증(정규식)에 걸림
        ...(values.newPassword && {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      onAccountUpdated(updated);
      // 수정 자체는 끝났으니 refetch 실패를 수정 실패로 취급하지 않는다 — GNB가 못 갱신되더라도
      // 계정 캐시는 다음 새로고침 때 맞춰진다. (#123, CustomerProfileEditForm과 동일 패턴)
      await refetch().catch(() => {});
      // 성공하면 토스트 대신 마이페이지로 돌아간다 — MoverProfileEditForm과 동일 패턴
      // (HoneyLatlll 리뷰, PR #135)
      router.push("/mover/mypage");
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "기본정보 수정에 실패했어요. 잠시 후 다시 시도해주세요"
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      // 컨텐츠(그리드)-버튼 간격: 피그마 실측 모바일/태블릿 32px(gap-8), 데스크톱 64px(pc:gap-16) —
      // 프로필 수정 화면(데스크톱 48px)과 다른 값이라 그대로 하드코딩. #73 재확인(2026-09-17).
      className="pc:gap-16 flex w-full flex-col gap-8"
    >
      <div className="pc:grid pc:grid-cols-2 pc:items-start pc:gap-x-30 pc:gap-y-8 flex flex-col gap-5">
        <div className="pc:gap-8 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <FieldLabel>이름</FieldLabel>
            <InputTextField
              label="이름"
              type="text"
              placeholder="이름을 입력해 주세요"
              size={fieldSize}
              autoComplete="name"
              errorMessage={errors.name?.message}
              {...register("name")}
            />
          </div>

          <div className="bg-line-100 h-px w-full" />

          {/* 이메일은 BE moverProfileUpdateSchema에 필드 자체가 없어 이 화면에서 수정 불가 —
              계정 조회 값을 읽기 전용으로만 보여준다 (CustomerProfileEditForm과 동일 패턴) */}
          <div className="flex flex-col gap-4">
            <FieldLabel required={false}>이메일</FieldLabel>
            <InputTextField
              label="이메일"
              type="email"
              size={fieldSize}
              value={account.email}
              disabled
              readOnly
            />
          </div>

          <div className="flex flex-col gap-4">
            <FieldLabel>전화번호</FieldLabel>
            <InputTextField
              label="전화번호"
              type="tel"
              inputMode="numeric"
              placeholder="하이픈(-) 없이 숫자만 입력해 주세요"
              size={fieldSize}
              autoComplete="tel"
              errorMessage={errors.phoneNumber?.message}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
              }}
              {...register("phoneNumber")}
            />
          </div>
        </div>

        {/* 데스크톱은 두 컬럼이 나란히 배치돼 구분선이 없지만(피그마 Desktop), 모바일/태블릿은 세로로
            쌓이면서 전화번호-현재 비밀번호 사이에 구분선이 있음(피그마 Tablet/Mobile) — pc에서만 숨김 */}
        <div className="pc:hidden bg-line-100 h-px w-full" />

        <div className="pc:gap-8 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <FieldLabel required={false}>현재 비밀번호</FieldLabel>
            <InputTextField
              label="현재 비밀번호"
              type="password"
              placeholder="현재 비밀번호를 입력해주세요"
              size={fieldSize}
              autoComplete="current-password"
              errorMessage={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
          </div>

          <div className="bg-line-100 h-px w-full" />

          <div className="flex flex-col gap-4">
            <FieldLabel required={false}>새 비밀번호</FieldLabel>
            <InputTextField
              label="새 비밀번호"
              type="password"
              placeholder="새 비밀번호를 입력해주세요"
              size={fieldSize}
              autoComplete="new-password"
              errorMessage={errors.newPassword?.message}
              {...register("newPassword")}
            />
          </div>

          <div className="flex flex-col gap-4">
            <FieldLabel required={false}>새 비밀번호 확인</FieldLabel>
            <InputTextField
              label="새 비밀번호 확인"
              type="password"
              placeholder="새 비밀번호를 다시 한번 입력해주세요"
              size={fieldSize}
              autoComplete="new-password"
              errorMessage={errors.newPasswordConfirm?.message}
              {...register("newPasswordConfirm")}
            />
          </div>
        </div>
      </div>

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
              // 변경된 필드가 없으면 제출을 막는다 — isDirty는 values 옵션이 갱신될 때마다(=계정
              // 재조회/저장 성공 시) 새 기준값과 비교해 자동으로 재계산된다 (PR #135 리뷰, singsangsong28)
              disabled={isSubmitting || !isDirty}
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
