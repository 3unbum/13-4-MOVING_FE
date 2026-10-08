"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/auth/FormField";
import TurnstileField, { TURNSTILE_SITE_KEY } from "@/components/auth/TurnstileField";
import Button from "@/components/common/Button";
import { AUTH_ERROR_CODES } from "@/constants/auth/error-codes";
import { useCountdown } from "@/hooks/useCountdown";
import { findAuthErrorMessageKey } from "@/lib/auth/auth-error-message";
import { findDailyLimitHours, findRetryAfterSeconds } from "@/lib/auth/rate-limit";
import { makeResetCodeSchema, type ResetCodeFormValues } from "@/lib/schemas/auth-schema";
import { authService, type UserRole } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/utils/api-error";
import { cn } from "@/lib/utils/cn";
import { formatCountdown } from "@/lib/utils/format-duration";

// BE는 만료 시각을 응답에 주지 않아 BE 정책(유효 5분, 같은 이메일 1분 1회)과 맞춘 FE 고정값으로 센다
// (ResetPasswordFlow와 동일). 그 외 제한(시간당·일일)은 429의 retryAfterSeconds로 타이머를 다시 시작한다.
const CODE_EXPIRY_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * - idle: 인증번호를 아직 안 보냈거나 "이메일 변경"으로 되돌아온 상태 — 이메일을 고칠 수 있다
 * - codeSent: 인증번호 입력 중 — 보낸 이메일과 입력란이 달라지면 안 되므로 이메일 입력란을 잠근다
 * - verified: 인증 완료 — 가입 버튼을 연다. BE는 인증한 (email, role)로만 가입을 받으므로 계속 잠가 둔다
 */
export type SignupEmailStatus = "idle" | "codeSent" | "verified";

interface SignupEmailVerificationProps {
  role: UserRole;
  // 회원가입 폼(RHF)이 들고 있는 이메일 값 — 이 컴포넌트는 값을 바꾸지 않고 읽기만 한다
  email: string;
  // 이메일 형식 검사를 통과했을 때만 발송할 수 있다 — 검사는 회원가입 폼 스키마가 담당
  canRequest: boolean;
  // 이메일 입력란 잠금·가입 버튼 활성화를 부모가 이 값으로 정해서 부모가 소유한다
  status: SignupEmailStatus;
  onStatusChange: (status: SignupEmailStatus) => void;
  // 발송 중에 이메일이 바뀌면 늦게 온 성공 응답이 이전 주소로 보낸 인증번호를 새 이메일의 codeSent로 적용한다 —
  // 부모가 그동안 이메일 입력란을 잠그도록 알린다
  onSendingChange: (isSending: boolean) => void;
}

// 회원가입 폼 안, 이메일 입력란 바로 아래에 놓이는 인증 영역. 바깥이 이미 <form>이라 중첩 form을 만들 수
// 없어서, 인증번호 입력은 별도 useForm으로 관리하고 버튼은 전부 type="button"으로 둔다.
// 인증 결과는 BE가 기억하고(인증 후 30분) 가입 요청 때 다시 확인하므로, FE는 토큰을 들고 있지 않는다.
export default function SignupEmailVerification({
  role,
  email,
  canRequest,
  status,
  onStatusChange,
  onSendingChange,
}: SignupEmailVerificationProps) {
  const t = useTranslations("auth");
  const tError = useTranslations("authError");

  const [isSending, setIsSending] = useState(false);
  // 실패 문구를 어느 이메일에 대한 것인지와 함께 들고 있다 — 이메일을 고치면 effect 없이도 문구가 사라진다
  const [sendError, setSendError] = useState<{ email: string; message: string }>();
  // 마지막으로 발송에 성공한 이메일 — "이메일 변경" 후 같은 이메일로 돌아와 1분 제한에 걸리면 받은
  // 인증번호를 그대로 입력할 수 있게 코드 입력 단계로 돌려보내는 데 쓴다
  const [lastSentEmail, setLastSentEmail] = useState<string>();
  // 인증번호를 새로 보낼 때마다 올려서 코드 입력 영역을 다시 마운트 — 이전 입력값·에러를 비운다
  const [codeSendCount, setCodeSendCount] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const { remainingSeconds, start: startCodeTimer } = useCountdown();
  const { remainingSeconds: resendRemainingSeconds, start: startResendTimer } = useCountdown();
  // idle에서 발송이 429에 걸렸을 때의 잠금 — 재발송 쿨다운과 따로 둬야 오타를 고친 다른 이메일로 바로
  // 보낼 수 있다 (ResetPasswordFlow와 동일)
  const { remainingSeconds: sendLockRemainingSeconds, start: startSendLock } = useCountdown();

  const isTurnstileMissing = Boolean(TURNSTILE_SITE_KEY) && !turnstileToken;
  const isSendLocked = sendLockRemainingSeconds > 0;
  const sendLockDailyHours = findDailyLimitHours(sendLockRemainingSeconds);

  const toErrorMessage = (error: unknown) => {
    const key = findAuthErrorMessageKey(error);
    return key ? tError(key) : t("resetPassword.failed");
  };

  // 성공이면 null, 실패면 BE 에러를 그대로 돌려준다. Turnstile 토큰은 1회용이라 결과와 상관없이 위젯을 새로 받는다.
  const requestCode = async (): Promise<unknown> => {
    setIsSending(true);
    onSendingChange(true);
    try {
      await authService.sendSignupCode({
        role,
        email,
        turnstileToken: turnstileToken ?? undefined,
      });
      return null;
    } catch (error) {
      return error;
    } finally {
      setIsSending(false);
      onSendingChange(false);
      setTurnstileToken(null);
      setTurnstileResetKey((key) => key + 1);
    }
  };

  const markCodeSent = () => {
    startCodeTimer(CODE_EXPIRY_SECONDS);
    startResendTimer(RESEND_COOLDOWN_SECONDS);
    setCodeSendCount((count) => count + 1);
    setLastSentEmail(email);
    onStatusChange("codeSent");
  };

  const handleSend = async () => {
    setSendError(undefined);
    const error = await requestCode();
    if (!error) {
      markCodeSent();
      return;
    }
    const retryAfterSeconds = findRetryAfterSeconds(error);
    if (
      retryAfterSeconds !== null &&
      retryAfterSeconds <= RESEND_COOLDOWN_SECONDS &&
      email === lastSentEmail
    ) {
      // 방금 이 이메일로 보낸 인증번호가 아직 유효하다 — 코드 타이머는 그때부터 계속 흐르고 있어 그대로 둔다
      startResendTimer(retryAfterSeconds);
      onStatusChange("codeSent");
      return;
    }
    if (retryAfterSeconds !== null) {
      startSendLock(retryAfterSeconds);
      return;
    }
    setSendError({ email, message: toErrorMessage(error) });
  };

  const handleResend = async (): Promise<string | undefined> => {
    const error = await requestCode();
    if (!error) {
      markCodeSent();
      return undefined;
    }
    const retryAfterSeconds = findRetryAfterSeconds(error);
    if (retryAfterSeconds !== null) {
      startResendTimer(retryAfterSeconds);
      return undefined;
    }
    return toErrorMessage(error);
  };

  const handleChangeEmail = () => {
    setSendError(undefined);
    onStatusChange("idle");
  };

  // 재발송 중에 이메일을 바꾸면 늦게 온 응답이 바뀐 화면을 codeSent로 되돌린다 — 응답이 올 때까지 막는다
  const changeEmailButton = (
    <button
      type="button"
      onClick={handleChangeEmail}
      disabled={isSending}
      className="text-14 tablet:text-16 shrink-0 font-semibold text-orange-400 underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
    >
      {t("signupVerification.changeEmail")}
    </button>
  );

  if (status === "verified") {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-13 tablet:text-14 font-medium text-orange-400">
          {t("signupVerification.verified")}
        </p>
        {changeEmailButton}
      </div>
    );
  }

  if (status === "codeSent") {
    return (
      <SignupCodeStep
        key={codeSendCount}
        role={role}
        email={email}
        remainingSeconds={remainingSeconds}
        resendRemainingSeconds={resendRemainingSeconds}
        isSending={isSending}
        isResendDisabled={isSending || resendRemainingSeconds > 0 || isTurnstileMissing}
        changeEmailButton={changeEmailButton}
        turnstile={
          <TurnstileField
            onToken={setTurnstileToken}
            resetKey={turnstileResetKey}
            appearance="interaction-only"
          />
        }
        onResend={handleResend}
        onExpire={() => startCodeTimer(0)}
        onVerified={() => onStatusChange("verified")}
      />
    );
  }

  const visibleSendError = sendError?.email === email ? sendError.message : undefined;
  const sendErrorMessage = isSendLocked
    ? sendLockDailyHours !== null
      ? t("resetPassword.dailyLimitReached", { hours: sendLockDailyHours })
      : t("retryAfter", { time: formatCountdown(sendLockRemainingSeconds) })
    : visibleSendError;

  return (
    <div className="flex flex-col gap-2">
      <TurnstileField
        onToken={setTurnstileToken}
        resetKey={turnstileResetKey}
        appearance="interaction-only"
      />
      <Button
        variant="outlined"
        size="sm"
        onClick={handleSend}
        disabled={!canRequest || isSending || isSendLocked || isTurnstileMissing}
      >
        {/* BE가 메일 발송을 마친 뒤에 응답해 1~3초 걸린다 — 버튼이 말없이 멈춘 것처럼 보이지 않게 진행 중임을
            알린다. Button의 icon prop은 글자 뒤에 붙어서, 스피너를 앞에 두려고 children에 넣는다 */}
        {isSending ? (
          <>
            <ButtonSpinner />
            {t("signupVerification.sending")}
          </>
        ) : (
          t("resetPassword.requestCode")
        )}
      </Button>
      <p
        className={cn(
          "text-13 tablet:text-14 font-medium",
          sendErrorMessage ? "text-red-200" : "text-gray-400"
        )}
      >
        {sendErrorMessage ?? t("signupVerification.guide")}
      </p>
    </div>
  );
}

interface SignupCodeStepProps {
  role: UserRole;
  email: string;
  remainingSeconds: number;
  resendRemainingSeconds: number;
  // 재발송 요청 중 — 링크 문구를 "보내는 중"으로 바꾼다
  isSending: boolean;
  isResendDisabled: boolean;
  changeEmailButton: ReactNode;
  // 재발송에도 Turnstile 토큰이 필요해 코드 입력 단계에서도 위젯을 보여준다
  turnstile: ReactNode;
  onResend: () => Promise<string | undefined>;
  // 만료·5회 오류면 그 인증번호로는 다시 시도해도 실패하므로 타이머를 끝내 인증 버튼을 막는다
  onExpire: () => void;
  onVerified: () => void;
}

function SignupCodeStep({
  role,
  email,
  remainingSeconds,
  resendRemainingSeconds,
  isSending,
  isResendDisabled,
  changeEmailButton,
  turnstile,
  onResend,
  onExpire,
  onVerified,
}: SignupCodeStepProps) {
  const t = useTranslations("auth");
  const tError = useTranslations("authError");
  const tValidation = useTranslations("validation");
  const schema = useMemo(() => makeResetCodeSchema(tValidation), [tValidation]);
  const isExpired = remainingSeconds <= 0;
  const dailyLimitHours = findDailyLimitHours(resendRemainingSeconds);
  const resendLabel = isSending
    ? t("signupVerification.sending")
    : dailyLimitHours !== null
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

  const verify = handleSubmit(async (values) => {
    try {
      await authService.verifySignupCode({ role, email, code: values.code });
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === AUTH_ERROR_CODES.SIGNUP_CODE_EXPIRED ||
          error.code === AUTH_ERROR_CODES.SIGNUP_CODE_ATTEMPTS_EXCEEDED)
      ) {
        onExpire();
      }
      const key = findAuthErrorMessageKey(error);
      setError("code", { message: key ? tError(key) : t("resetPassword.failed") });
      return;
    }
    onVerified();
  });

  const handleResendClick = async () => {
    const errorMessage = await onResend();
    if (errorMessage) setError("code", { message: errorMessage });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-13 tablet:text-14 text-black-300 min-w-0 break-all">
          {t("resetPassword.sentTo", { email })}
        </p>
        {changeEmailButton}
      </div>

      <div className="flex flex-col gap-2">
        <FormField
          id="signupCode"
          label={t("resetPassword.codeLabel")}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder={t("resetPassword.codePlaceholder")}
          errorMessage={errors.code?.message}
          // 바깥 회원가입 form이 Enter로 제출되지 않게 막고, 인증번호 확인으로 돌린다
          onKeyDown={(keyEvent) => {
            if (keyEvent.key !== "Enter") return;
            keyEvent.preventDefault();
            if (!isExpired) verify();
          }}
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

      <Button
        variant="outlined"
        size="sm"
        onClick={() => verify()}
        disabled={isSubmitting || !isValid || isExpired}
      >
        {t("signupVerification.verify")}
      </Button>

      <div className="flex flex-col gap-2">
        <p className="text-13 tablet:text-14 rounded-lg bg-orange-100 px-3 py-2 font-medium text-orange-400">
          {t("resetPassword.mailHelp")}
        </p>
        {turnstile}
        <button
          type="button"
          onClick={handleResendClick}
          disabled={isResendDisabled}
          className="text-14 tablet:text-16 self-start font-semibold text-orange-400 underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          {resendLabel}
        </button>
      </div>
    </div>
  );
}

// 버튼 글자색(current)을 따라가서 비활성(회색) 상태에서도 어색하지 않다. 모양은 앱 공통 로딩(loading.tsx)을 줄인 것
function ButtonSpinner() {
  return (
    <span
      aria-hidden
      className="size-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
