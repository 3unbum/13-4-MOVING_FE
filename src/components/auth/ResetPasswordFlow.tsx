"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import avatarLg from "@/assets/images/common/avatartion_lg.png";
import avatarMd from "@/assets/images/common/avatartion_md.png";
import truckLg from "@/assets/images/common/truck_lg.png";
import truckMd from "@/assets/images/common/truck_md.png";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import NewPasswordStep from "@/components/auth/NewPasswordStep";
import ResetCodeStep from "@/components/auth/ResetCodeStep";
import ResetEmailStep from "@/components/auth/ResetEmailStep";
import Toast from "@/components/common/Toast";
import { AUTH_ERROR_CODES } from "@/constants/auth/error-codes";
import { useCountdown } from "@/hooks/useCountdown";
import { findAuthErrorMessageKey } from "@/lib/auth/auth-error-message";
import { findRetryAfterSeconds } from "@/lib/auth/rate-limit";
import { authService, type UserRole } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/utils/api-error";

type ResetStep = "email" | "code" | "newPassword";

// BE는 만료 시각을 응답에 주지 않아 인증번호 유효시간(5분)은 BE 정책과 맞춘 FE 고정값으로 센다.
// 재발송 제한(같은 계정 1분 1회)도 같은 값으로 맞추고, 그 외 제한(시간당·일일)에 걸리면
// 429 응답의 retryAfterSeconds로 타이머를 다시 시작한다.
const CODE_EXPIRY_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
// 변경 완료 토스트를 읽을 시간을 준 뒤 로그인 페이지로 보낸다 (자동 로그인은 없음)
const REDIRECT_DELAY_MS = 2500;

interface ResetPasswordFlowProps {
  role: UserRole;
}

// 3단계(email → code → newPassword)를 페이지 이동 없이 같은 AuthCard 안에서 전환한다.
// 이 컴포넌트가 API 호출·단계 상태·타이머·라우팅을 소유하고, 각 Step은 자기 폼만 관리하다가
// 제출 값을 올려보낸 뒤 돌려받은 에러 문구를 표시한다.
export default function ResetPasswordFlow({ role }: ResetPasswordFlowProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tError = useTranslations("authError");
  const isCustomer = role === "CUSTOMER";

  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  // 인증번호를 새로 보낼 때마다 올려서 ResetCodeStep을 다시 마운트 — 이전 입력값·에러를 비운다
  const [codeSendCount, setCodeSendCount] = useState(0);
  // 재설정 시간 만료로 email 단계로 되돌아왔을 때 그 이유를 보여주기 위한 안내
  const [emailNotice, setEmailNotice] = useState<string>();
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const { remainingSeconds, start: startCodeTimer } = useCountdown();
  const { remainingSeconds: resendRemainingSeconds, start: startResendTimer } = useCountdown();
  // email 단계에서 발송 요청이 429에 걸렸을 때의 잠금 — 재발송 쿨다운과 따로 둬야
  // 오타를 고치러 돌아온 사용자가 다른 이메일로 바로 보낼 수 있다
  const { remainingSeconds: sendLockRemainingSeconds, start: startSendLock } = useCountdown();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 기다리는 사이 사용자가 다른 페이지로 나가면, 뒤늦게 로그인 페이지로 끌려가지 않게 취소한다
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const otherRoleHref = isCustomer ? "/mover/reset-password" : "/customer/reset-password";
  const loginHref = isCustomer ? "/customer/login" : "/mover/login";

  const toErrorMessage = (error: unknown) => {
    const key = findAuthErrorMessageKey(error);
    return key ? tError(key) : t("resetPassword.failed");
  };

  const markCodeSent = () => {
    startCodeTimer(CODE_EXPIRY_SECONDS);
    startResendTimer(RESEND_COOLDOWN_SECONDS);
    setCodeSendCount((count) => count + 1);
  };

  const handleEmailSubmit = async (submittedEmail: string) => {
    setEmailNotice(undefined);
    try {
      // 가입 여부를 숨기려고 미가입·소셜 계정이어도 204가 오므로, 성공하면 항상 code 단계로 넘어간다.
      await authService.sendPasswordResetCode({ role, email: submittedEmail });
    } catch (error) {
      const retryAfterSeconds = findRetryAfterSeconds(error);
      if (retryAfterSeconds !== null) {
        startSendLock(retryAfterSeconds);
        return undefined;
      }
      return toErrorMessage(error);
    }
    setEmail(submittedEmail);
    markCodeSent();
    setStep("code");
    return undefined;
  };

  const handleBackToEmail = () => setStep("email");

  const handleResend = async () => {
    try {
      await authService.sendPasswordResetCode({ role, email });
    } catch (error) {
      const retryAfterSeconds = findRetryAfterSeconds(error);
      if (retryAfterSeconds !== null) {
        startResendTimer(retryAfterSeconds);
        return undefined;
      }
      return toErrorMessage(error);
    }
    markCodeSent();
    return undefined;
  };

  const handleCodeSubmit = async (code: string) => {
    try {
      // 성공하면 BE가 재설정 토큰을 httpOnly 쿠키로 발급한다 (FE는 값을 들고 있지 않음).
      await authService.verifyPasswordResetCode({ role, email, code });
    } catch (error) {
      // 만료·5회 오류면 그 인증번호로는 다시 시도해도 실패하므로 타이머를 끝내 확인 버튼을 막는다
      if (
        error instanceof ApiError &&
        (error.code === AUTH_ERROR_CODES.RESET_CODE_EXPIRED ||
          error.code === AUTH_ERROR_CODES.RESET_CODE_ATTEMPTS_EXCEEDED)
      ) {
        startCodeTimer(0);
      }
      return toErrorMessage(error);
    }
    setStep("newPassword");
    return undefined;
  };

  const handlePasswordSubmit = async (newPassword: string) => {
    try {
      await authService.resetPassword({ newPassword });
    } catch (error) {
      // 재설정 토큰(10분, 1회용)이 만료되면 인증번호부터 다시 받아야 한다
      if (
        error instanceof ApiError &&
        error.code === AUTH_ERROR_CODES.INVALID_OR_EXPIRED_RESET_TOKEN
      ) {
        setEmailNotice(toErrorMessage(error));
        setStep("email");
        return undefined;
      }
      return toErrorMessage(error);
    }
    setIsPasswordChanged(true);
    // replace — 뒤로 가기로 이미 끝난(토큰을 쓴) 재설정 화면에 돌아오지 않게 한다
    redirectTimerRef.current = setTimeout(() => router.replace(loginHref), REDIRECT_DELAY_MS);
    return undefined;
  };

  return (
    <>
      <AuthCard
        mascotTabletSrc={isCustomer ? avatarMd : truckMd}
        mascotPcSrc={isCustomer ? avatarLg : truckLg}
        mascotTabletPositionClassName={
          isCustomer ? "-bottom-18.5 left-125.75" : "-bottom-17 left-125.75"
        }
        mascotPcPositionClassName="-bottom-13 left-170"
      >
        <AuthHeader
          prompt={isCustomer ? t("ifMover") : t("ifCustomer")}
          href={otherRoleHref}
          linkText={isCustomer ? t("moverPage") : t("customerPage")}
        />

        <div className="tablet:gap-8 flex w-full flex-col gap-6">
          <h1 className="text-20 tablet:text-24 text-black-black-400 text-center font-bold">
            {t("resetPassword.title")}
          </h1>

          {step === "email" && (
            <ResetEmailStep
              role={role}
              defaultEmail={email}
              noticeMessage={emailNotice}
              lockRemainingSeconds={sendLockRemainingSeconds}
              onSubmit={handleEmailSubmit}
            />
          )}
          {step === "code" && (
            <ResetCodeStep
              key={codeSendCount}
              email={email}
              remainingSeconds={remainingSeconds}
              resendRemainingSeconds={resendRemainingSeconds}
              onBack={handleBackToEmail}
              onResend={handleResend}
              onSubmit={handleCodeSubmit}
            />
          )}
          {step === "newPassword" && (
            <NewPasswordStep isCompleted={isPasswordChanged} onSubmit={handlePasswordSubmit} />
          )}
        </div>
      </AuthCard>

      {isPasswordChanged && (
        // 공통 Toast는 GNB 아래(상단)에 뜨는데, 폼 제출 직후엔 시선이 하단 버튼 쪽에 있어 아래로 내린다
        <Toast
          message={t("resetPassword.passwordChangedToast")}
          className="pc:top-auto tablet:bottom-16 top-auto bottom-10"
        />
      )}
    </>
  );
}
