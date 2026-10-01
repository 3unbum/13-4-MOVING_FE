"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import avatarLg from "@/assets/images/common/avatartion_lg.png";
import avatarMd from "@/assets/images/common/avatartion_md.png";
import truckLg from "@/assets/images/common/truck_lg.png";
import truckMd from "@/assets/images/common/truck_md.png";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import NewPasswordStep from "@/components/auth/NewPasswordStep";
import PasswordChangedModal from "@/components/auth/PasswordChangedModal";
import ResetCodeStep from "@/components/auth/ResetCodeStep";
import ResetEmailStep from "@/components/auth/ResetEmailStep";
import { useCountdown } from "@/hooks/useCountdown";
import type { UserRole } from "@/lib/services/auth-service";

type ResetStep = "email" | "code" | "newPassword";

// BE는 만료 시각을 응답에 주지 않아 인증번호 유효시간(5분)은 BE 정책과 맞춘 FE 고정값으로 센다.
// 재발송 제한(같은 계정 1분 1회)도 같은 값으로 맞추고, 그 외 제한(시간당·일일)에 걸리면
// TODO(logic): 429 응답의 retryAfterSeconds로 재발송 타이머를 다시 시작한다.
const CODE_EXPIRY_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

interface ResetPasswordFlowProps {
  role: UserRole;
}

// 3단계(email → code → newPassword)를 페이지 이동 없이 같은 AuthCard 안에서 전환한다.
// 이 컴포넌트가 단계 상태·타이머·라우팅을 전부 소유하고, 각 Step 컴포넌트는 표시 전용으로 둔다.
export default function ResetPasswordFlow({ role }: ResetPasswordFlowProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const isCustomer = role === "CUSTOMER";

  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const { remainingSeconds, start: startCodeTimer } = useCountdown();
  const { remainingSeconds: resendRemainingSeconds, start: startResendTimer } = useCountdown();

  const otherRoleHref = isCustomer ? "/mover/reset-password" : "/customer/reset-password";
  const loginHref = isCustomer ? "/customer/login" : "/mover/login";

  const handleEmailSubmit = (submittedEmail: string) => {
    // TODO(logic): POST /auth/password-reset/code { role, email } 호출.
    // BE는 가입 여부를 숨기려고 계정이 없어도 204를 주므로, 성공하면 항상 code 단계로 넘어간다.
    setEmail(submittedEmail);
    startCodeTimer(CODE_EXPIRY_SECONDS);
    startResendTimer(RESEND_COOLDOWN_SECONDS);
    setStep("code");
  };

  const handleBackToEmail = () => setStep("email");

  const handleResend = () => {
    // TODO(logic): POST /auth/password-reset/code 재호출 — 429면 retryAfterSeconds로 재발송 타이머 재시작.
    startCodeTimer(CODE_EXPIRY_SECONDS);
    startResendTimer(RESEND_COOLDOWN_SECONDS);
  };

  const handleCodeSubmit = (_code: string) => {
    // TODO(logic): POST /auth/password-reset/verify { role, email, code } — 성공 시 BE가 재설정 토큰을 httpOnly 쿠키로 발급.
    setStep("newPassword");
  };

  const handlePasswordSubmit = (_password: string, _passwordConfirm: string) => {
    // TODO(logic): POST /auth/password-reset { newPassword } — 401(토큰 만료·사용됨)이면 email 단계로 되돌린다.
    setIsPasswordChanged(true);
  };

  // 변경 완료 모달의 모든 닫기 경로(확인/X/ESC/바깥 클릭)가 여기로 모여 로그인 페이지로 보낸다.
  const handleConfirmChanged = () => {
    setIsPasswordChanged(false);
    router.replace(loginHref);
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

          {step === "email" && <ResetEmailStep role={role} onSubmit={handleEmailSubmit} />}
          {step === "code" && (
            <ResetCodeStep
              email={email}
              remainingSeconds={remainingSeconds}
              resendRemainingSeconds={resendRemainingSeconds}
              onBack={handleBackToEmail}
              onResend={handleResend}
              onSubmit={handleCodeSubmit}
            />
          )}
          {step === "newPassword" && <NewPasswordStep onSubmit={handlePasswordSubmit} />}
        </div>
      </AuthCard>

      <PasswordChangedModal open={isPasswordChanged} onConfirm={handleConfirmChanged} />
    </>
  );
}
