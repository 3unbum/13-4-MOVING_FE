"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import avatarLg from "@/assets/images/common/avatartion_lg.png";
import avatarMd from "@/assets/images/common/avatartion_md.png";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthSwitchLink from "@/components/auth/AuthSwitchLink";
import FormField from "@/components/auth/FormField";
import ProfileRegisterModal from "@/components/auth/ProfileRegisterModal";
import SocialLoginSection from "@/components/auth/SocialLoginSection";
import { useCountdown } from "@/hooks/useCountdown";
import { findRetryAfterSeconds } from "@/lib/auth/rate-limit";
import { authService } from "@/lib/services/auth-service";
import { makeLoginSchema, type LoginFormValues } from "@/lib/schemas/auth-schema";
import { ApiError } from "@/lib/utils/api-error";
import { formatCountdown } from "@/lib/utils/format-duration";
import { useAuth } from "@/providers/AuthProvider";

// TODO: 로그인 전 페이지로 복귀는 미구현 — 호출부들이 ?redirect=를 넘기기 시작할 때 useSearchParams(+Suspense)로 추가.
export default function CustomerLoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { remainingSeconds, start: startLockout } = useCountdown();
  const isLocked = remainingSeconds > 0;
  const t = useTranslations("auth");
  const tp = useTranslations("profile");
  const tValidation = useTranslations("validation");
  // 매 렌더마다 새 스키마가 생기면 zodResolver도 교체돼 폼이 불필요하게 다시 만들어집니다
  const schema = useMemo(() => makeLoginSchema(tValidation), [tValidation]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await authService.login({ role: "CUSTOMER", ...values });
      await refetch();
      // customer는 프로필이 선택사항이라 강제 이동은 안 시키고, 아직 등록 안 한 계정에만 모달로 유도한다.
      if (result.hasProfile) {
        router.replace("/");
      } else {
        setIsProfileModalOpen(true);
      }
    } catch (error) {
      // rate limit 초과는 일반 로그인 실패와 별개로, 남은 시간을 보여주며 재시도 자체를 막는다.
      // retryAfterSeconds가 없거나 이상하면 카운트다운 없이 일반 에러 메시지로만 처리한다.
      const retryAfterSeconds = findRetryAfterSeconds(error);
      if (retryAfterSeconds !== null) {
        startLockout(retryAfterSeconds);
        return;
      }
      const message = error instanceof ApiError ? error.message : t("loginFailed");
      setError("root", { message });
    }
  };

  const skipProfileRegister = () => router.replace("/");

  return (
    <>
      <AuthCard
        mascotTabletSrc={avatarMd}
        mascotPcSrc={avatarLg}
        mascotTabletPositionClassName="-bottom-18.5 left-125.75"
        mascotPcPositionClassName="-bottom-13 left-170"
      >
        <AuthHeader prompt={t("ifMover")} href="/mover/login" linkText={t("moverPage")} />

        {/* Figma 모바일은 header↔content 40px, content↔social 48px로 다른데 AuthCard는 gap 하나뿐이라
          이 wrapper로 두 간격을 분리 (태블릿·PC는 둘 다 48px이라 문제없음) */}
        <div className="flex w-full flex-col gap-12">
          <div className="tablet:gap-6 flex w-full flex-col gap-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="tablet:gap-14 flex flex-col gap-8"
              noValidate
            >
              <div className="tablet:gap-8 flex flex-col gap-4">
                <FormField
                  id="email"
                  label={tp("email")}
                  type="email"
                  placeholder={tp("emailPlaceholder")}
                  autoComplete="email"
                  errorMessage={errors.email?.message}
                  {...register("email")}
                />
                <FormField
                  id="password"
                  label={tp("password")}
                  type="password"
                  placeholder={tp("passwordPlaceholder")}
                  autoComplete="current-password"
                  errorMessage={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <AuthSubmitButton
                disabled={isSubmitting || !isValid || isLocked}
                errorMessage={
                  isLocked
                    ? t("retryAfter", { time: formatCountdown(remainingSeconds) })
                    : errors.root?.message
                }
              >
                {t("loginTitle")}
              </AuthSubmitButton>
            </form>

            <AuthSwitchLink
              prompt={t("notMemberYet")}
              href="/customer/signup"
              linkText={t("signupWithEmail")}
            />
          </div>

          <SocialLoginSection action="login" role="CUSTOMER" />
        </div>
      </AuthCard>

      <ProfileRegisterModal
        open={isProfileModalOpen}
        onSkip={skipProfileRegister}
        onRegister={() => router.replace("/customer/profile-register")}
      />
    </>
  );
}
