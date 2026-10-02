"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";
import Button from "@/components/common/Button";
import { findDailyLimitHours } from "@/lib/auth/rate-limit";
import { makeResetCodeSchema, type ResetCodeFormValues } from "@/lib/schemas/auth-schema";
import { cn } from "@/lib/utils/cn";
import { formatCountdown } from "@/lib/utils/format-duration";

interface ResetCodeStepProps {
  // 어느 이메일로 보냈는지 표시용 — 값 자체는 부모(ResetPasswordFlow)가 들고 있음
  email: string;
  // 인증번호 만료까지 남은 시간(초). 0이면 만료 — 부모가 useCountdown으로 소유.
  remainingSeconds: number;
  // 재발송 제한까지 남은 시간(초). 0보다 크면 재발송 버튼 비활성화.
  resendRemainingSeconds: number;
  onBack: () => void;
  // 아래 두 핸들러는 실패하면 화면에 보여줄 문구를 돌려준다 (성공이면 undefined).
  // 재발송에 성공하면 부모가 key를 바꿔 이 컴포넌트를 새로 마운트하므로 입력값도 함께 비워진다.
  onResend: () => Promise<string | undefined>;
  onSubmit: (code: string) => Promise<string | undefined>;
}

export default function ResetCodeStep({
  email,
  remainingSeconds,
  resendRemainingSeconds,
  onBack,
  onResend,
  onSubmit,
}: ResetCodeStepProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const schema = useMemo(() => makeResetCodeSchema(tValidation), [tValidation]);
  // 응답 전에 재발송을 여러 번 누르면 바로 429에 걸리므로 요청 중에는 막는다
  const [isResending, setIsResending] = useState(false);
  const isExpired = remainingSeconds <= 0;
  const isResendDisabled = isResending || resendRemainingSeconds > 0;
  const dailyLimitHours = findDailyLimitHours(resendRemainingSeconds);
  const resendLabel =
    dailyLimitHours !== null
      ? t("resetPassword.dailyLimitReached", { hours: dailyLimitHours })
      : resendRemainingSeconds > 0
        ? t("resetPassword.resendAvailableAfter", {
            time: formatCountdown(resendRemainingSeconds),
          })
        : t("resetPassword.resend");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetCodeFormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const submit = async (values: ResetCodeFormValues) => {
    const errorMessage = await onSubmit(values.code);
    if (errorMessage) setError("code", { message: errorMessage });
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const errorMessage = await onResend();
      if (errorMessage) setError("root", { message: errorMessage });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="tablet:gap-8 flex w-full flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <p className="text-14 tablet:text-16 text-black-300">
          {t("resetPassword.sentTo", { email })}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-14 tablet:text-16 self-start font-semibold text-orange-400 underline"
        >
          {t("resetPassword.changeEmail")}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <FormField
          id="code"
          label={t("resetPassword.codeLabel")}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder={t("resetPassword.codePlaceholder")}
          errorMessage={errors.code?.message}
          {...register("code")}
        />
        {/* 인증번호를 틀려도 남은 시간은 계속 보여야 해서 FormField의 에러 슬롯과 분리해 항상 렌더 */}
        <p
          className={cn(
            "text-13 tablet:text-14 font-medium",
            isExpired ? "text-red-200" : "text-gray-400"
          )}
        >
          {isExpired
            ? t("resetPassword.expired")
            : `${t("resetPassword.remainingTimeLabel")} ${formatCountdown(remainingSeconds)}`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {/* 미가입 이메일(오타 포함)에도 BE는 같은 응답을 줘서 메일이 안 온 이유를 알려줄 수 없다 —
            에러를 보기 전에 스스로 확인할 수 있게 항상 안내한다 */}
        <p className="text-13 tablet:text-14 rounded-lg bg-orange-100 px-3 py-2 font-medium text-orange-400">
          {t("resetPassword.mailHelp")}
        </p>
        {isExpired ? (
          // 만료·5회 오류면 이 인증번호로는 진행할 수 없어 재발송이 유일한 다음 행동 — 버튼으로 강조
          <Button variant="outlined" size="sm" onClick={handleResend} disabled={isResendDisabled}>
            {resendLabel}
          </Button>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResendDisabled}
            className="text-14 tablet:text-16 self-start font-semibold text-orange-400 underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
          >
            {resendLabel}
          </button>
        )}
      </div>

      <AuthSubmitButton
        disabled={isSubmitting || !isValid || isExpired}
        errorMessage={errors.root?.message}
      >
        {tCommon("confirm")}
      </AuthSubmitButton>
    </form>
  );
}
