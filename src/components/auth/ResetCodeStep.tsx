"use client";

import { useTranslations } from "next-intl";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";
import { cn } from "@/lib/utils/cn";
import { formatCountdown } from "@/lib/utils/format-duration";

interface ResetCodeStepProps {
  // 어느 이메일로 보냈는지 표시용 — 값 자체는 부모(ResetPasswordFlow)가 들고 있음
  email: string;
  // 인증번호 만료까지 남은 시간(초). 0이면 만료 — 부모가 useCountdown으로 소유.
  remainingSeconds: number;
  // 재발송 제한까지 남은 시간(초). 0보다 크면 재발송 버튼 비활성화.
  resendRemainingSeconds: number;
  errorMessage?: string;
  onBack: () => void;
  onResend: () => void;
  onSubmit: (code: string) => void;
}

// 표시 전용 — 인증번호 입력값만 내부 useState, 나머지(이메일·타이머·에러)는 전부 props.
export default function ResetCodeStep({
  email,
  remainingSeconds,
  resendRemainingSeconds,
  errorMessage,
  onBack,
  onResend,
  onSubmit,
}: ResetCodeStepProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [code, setCode] = useState("");
  const isExpired = remainingSeconds <= 0;
  const isResendDisabled = resendRemainingSeconds > 0;

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="tablet:gap-8 flex w-full flex-col gap-6" noValidate>
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
          maxLength={6}
          placeholder={t("resetPassword.codePlaceholder")}
          value={code}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value)}
          errorMessage={errorMessage}
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

      <button
        type="button"
        onClick={onResend}
        disabled={isResendDisabled}
        className="text-14 tablet:text-16 self-start font-semibold text-orange-400 underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
      >
        {isResendDisabled
          ? t("resetPassword.resendAvailableAfter", {
              time: formatCountdown(resendRemainingSeconds),
            })
          : t("resetPassword.resend")}
      </button>

      <AuthSubmitButton disabled={isExpired}>{tCommon("confirm")}</AuthSubmitButton>
    </form>
  );
}
