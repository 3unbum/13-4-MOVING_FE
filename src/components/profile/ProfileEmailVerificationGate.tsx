"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";
import { AUTH_ERROR_CODES } from "@/constants/auth/error-codes";
import { useCountdown } from "@/hooks/useCountdown";
import { findAuthErrorMessageKey } from "@/lib/auth/auth-error-message";
import { findDailyLimitHours, findRetryAfterSeconds } from "@/lib/auth/rate-limit";
import { makeResetCodeSchema, type ResetCodeFormValues } from "@/lib/schemas/auth-schema";
import { profileService } from "@/lib/services/profile-service";
import { ApiError } from "@/lib/utils/api-error";
import { formatCountdown } from "@/lib/utils/format-duration";

const CODE_EXPIRY_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

type Step = "request" | "code";

interface ProfileEmailVerificationGateProps {
  // 인증번호를 받을 이메일 표시용 — 발송 대상 자체는 BE가 로그인 세션(req.user.id)으로 판단한다.
  email: string;
  // 최근 30분 이내 인증 여부 — true면 인증 화면 없이 바로 children을 보여준다(useProfileEditVerified).
  isVerified: boolean;
  // 인증 성공 시 호출 — 부모가 isVerified를 true로 바꿔 준다
  onVerified: () => void;
  // 인증 성공 후에만 보여줄 실제 수정 화면
  children: ReactNode;
}

// #131(이슈) / #157 재설계: 소셜 로그인 계정은 비밀번호가 없어 "비밀번호 재확인"으로 프로필 수정
// 진입을 막을 수 없는 문제가 있었다 — 그렇다고 계정 유형별로 확인 수단을 나누면 일관성이 깨져서,
// 계정 유형과 무관하게 진입 자체는 이메일 인증으로 통일했다. 비밀번호 재확인은 "비밀번호 변경"
// 액션에만 남겼다(CustomerProfileEditForm/MoverBasicInfoEditForm의 currentPassword 참고).
// 인증 결과는 BE가 기억한다(인증 성공 시각 기준 30분) — 계정 조회 응답의 isProfileEditVerified로 받아
// 새로고침하거나 다른 페이지에 다녀와도 인증 화면을 다시 거치지 않는다. 계정 정보 수정 요청은 BE가
// 같은 기준으로 한 번 더 확인하므로(403), 화면을 건너뛰어도 우회가 되지 않는다.
export default function ProfileEmailVerificationGate({
  email,
  isVerified,
  onVerified,
  children,
}: ProfileEmailVerificationGateProps) {
  if (isVerified) return <>{children}</>;

  return <ProfileEmailVerificationForm email={email} onVerified={onVerified} />;
}

interface ProfileEmailVerificationFormProps {
  email: string;
  onVerified: () => void;
}

function ProfileEmailVerificationForm({ email, onVerified }: ProfileEmailVerificationFormProps) {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const tError = useTranslations("authError");
  const tValidation = useTranslations("validation");
  const schema = useMemo(() => makeResetCodeSchema(tValidation), [tValidation]);

  const [step, setStep] = useState<Step>("request");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [requestError, setRequestError] = useState<string>();
  // 인증번호를 새로 보낼 때마다 올려서 코드 입력 폼을 다시 마운트 — 이전 입력값·에러를 비운다
  const [codeSendCount, setCodeSendCount] = useState(0);
  const { remainingSeconds, start: startCodeTimer } = useCountdown();
  const { remainingSeconds: resendRemainingSeconds, start: startResendTimer } = useCountdown();
  // 발송 요청이 rate limit(429)에 걸렸을 때의 잠금 — ResetEmailStep과 동일 패턴
  const { remainingSeconds: lockRemainingSeconds, start: startSendLock } = useCountdown();
  const isLocked = lockRemainingSeconds > 0;
  const dailyLimitHours = findDailyLimitHours(lockRemainingSeconds);

  const toErrorMessage = (error: unknown) => {
    const key = findAuthErrorMessageKey(error);
    return key ? tError(key) : tAuth("resetPassword.failed");
  };

  const markCodeSent = () => {
    startCodeTimer(CODE_EXPIRY_SECONDS);
    startResendTimer(RESEND_COOLDOWN_SECONDS);
    setCodeSendCount((count) => count + 1);
  };

  const handleRequestCode = async () => {
    setRequestError(undefined);
    setIsRequesting(true);
    try {
      await profileService.sendEmailVerificationCode();
      markCodeSent();
      setStep("code");
    } catch (error) {
      const retryAfterSeconds = findRetryAfterSeconds(error);
      if (retryAfterSeconds !== null) {
        startSendLock(retryAfterSeconds);
      } else {
        setRequestError(toErrorMessage(error));
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await profileService.sendEmailVerificationCode();
      markCodeSent();
      return undefined;
    } catch (error) {
      const retryAfterSeconds = findRetryAfterSeconds(error);
      if (retryAfterSeconds !== null) {
        startResendTimer(retryAfterSeconds);
        return undefined;
      }
      return toErrorMessage(error);
    } finally {
      setIsResending(false);
    }
  };

  if (step === "request") {
    return (
      <div className="tablet:gap-8 flex w-full flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-18 tablet:text-20 text-black-black-400 font-bold">
            {t("emailVerifyTitle")}
          </h2>
          <p className="text-13 tablet:text-14 text-gray-400">
            {t("emailVerifyDescription", { email })}
          </p>
        </div>

        <form
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            handleRequestCode();
          }}
        >
          <AuthSubmitButton
            disabled={isRequesting || isLocked}
            errorMessage={
              isLocked
                ? dailyLimitHours !== null
                  ? tAuth("resetPassword.dailyLimitReached", { hours: dailyLimitHours })
                  : tAuth("retryAfter", { time: formatCountdown(lockRemainingSeconds) })
                : requestError
            }
          >
            {tAuth("resetPassword.requestCode")}
          </AuthSubmitButton>
        </form>
      </div>
    );
  }

  return (
    <ProfileEmailCodeStep
      key={codeSendCount}
      email={email}
      remainingSeconds={remainingSeconds}
      resendRemainingSeconds={resendRemainingSeconds}
      isResending={isResending}
      onResend={handleResend}
      onExpire={() => startCodeTimer(0)}
      onVerified={onVerified}
      schema={schema}
    />
  );
}

interface ProfileEmailCodeStepProps {
  email: string;
  remainingSeconds: number;
  resendRemainingSeconds: number;
  isResending: boolean;
  onResend: () => Promise<string | undefined>;
  // 만료·5회 오류면 그 인증번호로는 다시 시도해도 실패하므로 타이머를 끝내 확인 버튼을 막는다
  // (ResetPasswordFlow.handleCodeSubmit과 동일 패턴)
  onExpire: () => void;
  onVerified: () => void;
  schema: ReturnType<typeof makeResetCodeSchema>;
}

function ProfileEmailCodeStep({
  email,
  remainingSeconds,
  resendRemainingSeconds,
  isResending,
  onResend,
  onExpire,
  onVerified,
  schema,
}: ProfileEmailCodeStepProps) {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const tError = useTranslations("authError");
  const tCommon = useTranslations("common");
  const dailyLimitHours = findDailyLimitHours(resendRemainingSeconds);
  const isExpired = remainingSeconds <= 0;
  const isResendDisabled = isResending || resendRemainingSeconds > 0;
  const resendLabel =
    dailyLimitHours !== null
      ? tAuth("resetPassword.dailyLimitReached", { hours: dailyLimitHours })
      : resendRemainingSeconds > 0
        ? tAuth("resetPassword.resendAvailableAfter", {
            time: formatCountdown(resendRemainingSeconds),
          })
        : tAuth("resetPassword.resend");

  const toErrorMessage = (error: unknown) => {
    const key = findAuthErrorMessageKey(error);
    return key ? tError(key) : tAuth("resetPassword.failed");
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetCodeFormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const submit = async (values: ResetCodeFormValues) => {
    try {
      await profileService.verifyEmailVerificationCode({ code: values.code });
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === AUTH_ERROR_CODES.PROFILE_EDIT_CODE_EXPIRED ||
          error.code === AUTH_ERROR_CODES.PROFILE_EDIT_CODE_ATTEMPTS_EXCEEDED)
      ) {
        onExpire();
      }
      setError("root", { message: toErrorMessage(error) });
      return;
    }
    onVerified();
  };

  const handleResendClick = async () => {
    const errorMessage = await onResend();
    if (errorMessage) setError("root", { message: errorMessage });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="tablet:gap-8 flex w-full flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-18 tablet:text-20 text-black-black-400 font-bold">
          {t("emailVerifyTitle")}
        </h2>
        <p className="text-14 tablet:text-16 text-black-300">
          {tAuth("resetPassword.sentTo", { email })}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <FormField
          id="profile-edit-verification-code"
          label={tAuth("resetPassword.codeLabel")}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder={tAuth("resetPassword.codePlaceholder")}
          errorMessage={errors.code?.message}
          {...register("code")}
        />
        {/* 인증번호를 틀려도 남은 시간은 계속 보여야 해서 FormField의 에러 슬롯과 분리해 항상 렌더 */}
        <p
          className={
            isExpired
              ? "text-13 tablet:text-14 font-medium text-red-200"
              : "text-13 tablet:text-14 font-medium text-gray-400"
          }
        >
          {isExpired
            ? tAuth("resetPassword.expired")
            : `${tAuth("resetPassword.remainingTimeLabel")} ${formatCountdown(remainingSeconds)}`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-13 tablet:text-14 rounded-lg bg-orange-100 px-3 py-2 font-medium text-orange-400">
          {tAuth("resetPassword.mailHelp")}
        </p>
        <button
          type="button"
          onClick={handleResendClick}
          disabled={isResendDisabled}
          className="text-14 tablet:text-16 self-start font-semibold text-orange-400 underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          {resendLabel}
        </button>
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
