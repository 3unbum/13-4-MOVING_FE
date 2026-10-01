"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";
import { findDailyLimitHours } from "@/lib/auth/rate-limit";
import { makeResetEmailSchema, type ResetEmailFormValues } from "@/lib/schemas/auth-schema";
import type { UserRole } from "@/lib/services/auth-service";
import { formatCountdown } from "@/lib/utils/format-duration";

interface ResetEmailStepProps {
  // 소셜 가입 안내문 안의 "소셜 로그인" 링크가 role별 로그인 페이지를 가리켜야 해서 필요
  role: UserRole;
  // "이메일 다시 입력"으로 돌아왔을 때 오타만 고치면 되도록 직전 값을 채워 둔다
  defaultEmail: string;
  // 다른 단계에서 넘어온 안내(예: 재설정 시간 만료로 처음부터 다시 해야 할 때)
  noticeMessage?: string;
  // 발송 요청이 rate limit(429)에 걸려 다시 보낼 수 있을 때까지 남은 시간(초)
  lockRemainingSeconds: number;
  // 실패하면 화면에 보여줄 문구를 돌려준다 (성공·rate limit은 부모가 처리하고 undefined)
  onSubmit: (email: string) => Promise<string | undefined>;
}

export default function ResetEmailStep({
  role,
  defaultEmail,
  noticeMessage,
  lockRemainingSeconds,
  onSubmit,
}: ResetEmailStepProps) {
  const t = useTranslations("auth");
  const tp = useTranslations("profile");
  const tValidation = useTranslations("validation");
  const schema = useMemo(() => makeResetEmailSchema(tValidation), [tValidation]);
  const loginHref = role === "CUSTOMER" ? "/customer/login" : "/mover/login";
  const isLocked = lockRemainingSeconds > 0;
  const dailyLimitHours = findDailyLimitHours(lockRemainingSeconds);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetEmailFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: defaultEmail },
  });

  const submit = async (values: ResetEmailFormValues) => {
    const errorMessage = await onSubmit(values.email);
    if (errorMessage) setError("root", { message: errorMessage });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="tablet:gap-8 flex w-full flex-col gap-6"
      noValidate
    >
      <FormField
        id="email"
        label={tp("email")}
        type="email"
        placeholder={tp("emailPlaceholder")}
        autoComplete="email"
        errorMessage={errors.email?.message}
        {...register("email")}
      />

      <div className="flex flex-col gap-1">
        <p className="text-13 tablet:text-14 text-gray-400">{t("resetPassword.guideNotice")}</p>
        <p className="text-13 tablet:text-14 text-gray-400">
          {t.rich("resetPassword.guideSocialRich", {
            link: (chunks) => (
              <Link href={loginHref} className="font-semibold text-orange-400 underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>

      <AuthSubmitButton
        disabled={isSubmitting || !isValid || isLocked}
        errorMessage={
          isLocked
            ? dailyLimitHours !== null
              ? t("resetPassword.dailyLimitReached", { hours: dailyLimitHours })
              : t("retryAfter", { time: formatCountdown(lockRemainingSeconds) })
            : (errors.root?.message ?? noticeMessage)
        }
      >
        {t("resetPassword.requestCode")}
      </AuthSubmitButton>
    </form>
  );
}
