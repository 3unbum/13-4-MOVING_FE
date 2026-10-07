"use client";

import { isProfileEditVerificationRequiredError } from "@/hooks/useProfileEditVerified";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import InputTextField from "@/components/common/InputTextfield";
import Toast from "@/components/common/Toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import FieldLabel from "@/components/profile/FieldLabel";
import {
  makeMoverBasicInfoUpdateSchema,
  type MoverBasicInfoUpdateFormValues,
} from "@/lib/schemas/profile-schema";
import { profileService } from "@/lib/services/profile-service";
import type { MoverAccountResponse } from "@/lib/services/auth-service";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { useAuth } from "@/providers/AuthProvider";

const PC_QUERY = "(min-width: 1280px)";

interface MoverBasicInfoEditFormProps {
  account: MoverAccountResponse;
  onAccountUpdated: (account: MoverAccountResponse) => void;
  // 인증 후 30분이 지나 BE가 403으로 거절하면 부모가 인증 화면을 다시 띄운다
  onVerificationRequired: () => void;
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
  onVerificationRequired,
}: MoverBasicInfoEditFormProps) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tAuthError = useTranslations("authError");
  const router = useRouter();
  const { refetch } = useAuth();
  const [submitError, setSubmitError] = useState<string>();
  // PC에서만 필드를 md 크기로 키움 (CustomerProfileEditForm과 동일 패턴)
  const isPc = useMediaQuery(PC_QUERY);
  const fieldSize = isPc ? "md" : "sm";

  // account가 바뀔 때만 새로 계산 — 매 렌더마다 accountToFormValues를 새로 호출하면 매번 다른
  // 객체 참조가 useForm의 values 옵션에 들어가게 된다 (MunChiho 리뷰, PR #135)
  const formValues = useMemo(() => accountToFormValues(account), [account]);

  const tValidation = useTranslations("validation");

  // 매 렌더마다 새 스키마가 생기면 zodResolver도 교체돼 폼이 불필요하게 다시 만들어집니다

  const schema = useMemo(() => makeMoverBasicInfoUpdateSchema(tValidation), [tValidation]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MoverBasicInfoUpdateFormValues>({
    resolver: zodResolver(schema),
    // account가 나중에(부모의 재조회로) 바뀌면 RHF가 그 시점에 폼을 다시 리셋해준다 — 비밀번호
    // 필드는 accountToFormValues가 항상 빈 문자열을 돌려주므로 제출 성공 후 자동으로 비워진다.
    values: formValues,
  });

  // 실패 토스트가 다음 제출 전까지 계속 떠 있던 문제 — 일정 시간 뒤 자동으로 닫는다 (MunChiho 리뷰, PR #135)
  useEffect(() => {
    if (!submitError) return;
    const timer = window.setTimeout(() => setSubmitError(undefined), 3000);
    return () => window.clearTimeout(timer);
  }, [submitError]);

  async function onSubmit(values: MoverBasicInfoUpdateFormValues) {
    setSubmitError(undefined);
    try {
      const updated = await profileService.updateMover({
        name: values.name,
        phoneNumber: values.phoneNumber,
        // #131: currentPassword/newPassword 둘 다 비밀번호를 실제로 바꿀 때만 실어 보낸다 —
        // 진입 자체는 이메일 인증(ProfileEmailVerificationGate)으로 이미 본인 확인이 끝났다.
        // 빈 문자열을 보내면 BE 검증(정규식)에 걸리므로 newPassword가 있을 때만 포함한다.
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
      if (isProfileEditVerificationRequiredError(error)) {
        onVerificationRequired();
        return;
      }
      setSubmitError(toAuthErrorMessage(error, tAuthError, t("basicInfoUpdateFailed")));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      // 실패 에러가 떠 있는 채로 아무 필드나 고치기 시작하면 바로 지운다 — 타이머가 아직 안 끝났어도
      // 사용자가 이미 재시도를 시작했다는 신호라서 (coderabbitai 리뷰, PR #135)
      onChange={() => {
        if (submitError) setSubmitError(undefined);
      }}
      // 컨텐츠(그리드)-버튼 간격: 피그마 실측 모바일/태블릿 32px(gap-8), 데스크톱 64px(pc:gap-16) —
      // 프로필 수정 화면(데스크톱 48px)과 다른 값이라 그대로 하드코딩. #73 재확인(2026-09-17).
      className="pc:gap-16 flex w-full flex-col gap-8"
    >
      <div className="pc:grid pc:grid-cols-2 pc:items-start pc:gap-x-30 pc:gap-y-8 flex flex-col gap-5">
        <div className="pc:gap-8 flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <FieldLabel>{t("name")}</FieldLabel>
            <InputTextField
              label={t("name")}
              type="text"
              placeholder={t("namePlaceholder")}
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
            <FieldLabel required={false}>{t("email")}</FieldLabel>
            <InputTextField
              label={t("email")}
              type="email"
              size={fieldSize}
              value={account.email}
              disabled
              readOnly
            />
          </div>

          <div className="flex flex-col gap-4">
            <FieldLabel>{t("phone")}</FieldLabel>
            <InputTextField
              label={t("phone")}
              type="tel"
              inputMode="numeric"
              placeholder={t("phonePlaceholder")}
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

        {/* #131: 소셜 로그인 계정(hasPassword === false)은 비밀번호 자체가 없어 변경할 수 없으므로
            구분선을 포함해 이 컬럼 전체를 숨긴다 — 2열 그리드가 1열로 자연스럽게 접힌다. 이 화면
            진입 자체는 이미 이메일 인증을 통과한 뒤라(MoverBasicInfoEditPanel의
            ProfileEmailVerificationGate) 본인 확인은 끝난 상태 — 아래 필드는 "비밀번호를 바꾸고
            싶을 때만" 쓰는 선택 입력이다. */}
        {account.hasPassword && (
          <>
            {/* 데스크톱은 두 컬럼이 나란히 배치돼 구분선이 없지만(피그마 Desktop), 모바일/태블릿은
                세로로 쌓이면서 전화번호-현재 비밀번호 사이에 구분선이 있음(피그마 Tablet/Mobile) —
                pc에서만 숨김 */}
            <div className="pc:hidden bg-line-100 h-px w-full" />

            <div className="pc:gap-8 flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <FieldLabel required={false}>{t("currentPassword")}</FieldLabel>
                {/* 비밀번호를 바꿀 때만 현재 비밀번호가 필요하다는 걸 안내 */}
                <p className="text-12 text-black-100 pc:text-16">{t("currentPasswordNotice")}</p>
                <InputTextField
                  label={t("currentPassword")}
                  type="password"
                  placeholder={t("currentPasswordPlaceholder")}
                  size={fieldSize}
                  autoComplete="current-password"
                  errorMessage={errors.currentPassword?.message}
                  {...register("currentPassword")}
                />
              </div>

              <div className="bg-line-100 h-px w-full" />

              <div className="flex flex-col gap-4">
                <FieldLabel required={false}>{t("newPassword")}</FieldLabel>
                <InputTextField
                  label={t("newPassword")}
                  type="password"
                  placeholder={t("newPasswordPlaceholder")}
                  size={fieldSize}
                  autoComplete="new-password"
                  errorMessage={errors.newPassword?.message}
                  {...register("newPassword")}
                />
              </div>

              <div className="flex flex-col gap-4">
                <FieldLabel required={false}>{t("newPasswordConfirm")}</FieldLabel>
                <InputTextField
                  label={t("newPasswordConfirm")}
                  type="password"
                  placeholder={t("newPasswordConfirmPlaceholder")}
                  size={fieldSize}
                  autoComplete="new-password"
                  errorMessage={errors.newPasswordConfirm?.message}
                  {...register("newPasswordConfirm")}
                />
              </div>
            </div>
          </>
        )}
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
              {tCommon("cancel")}
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
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </div>
      </div>

      {submitError && <Toast message={submitError} />}
    </form>
  );
}
