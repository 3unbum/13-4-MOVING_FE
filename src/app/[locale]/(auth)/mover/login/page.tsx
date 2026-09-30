"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import truckLg from "@/assets/images/common/truck_lg.png";
import truckMd from "@/assets/images/common/truck_md.png";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthSwitchLink from "@/components/auth/AuthSwitchLink";
import FormField from "@/components/auth/FormField";
import SocialLoginSection from "@/components/auth/SocialLoginSection";
import { useCountdown } from "@/hooks/useCountdown";
import { findRetryAfterSeconds } from "@/lib/auth/rate-limit";
import { authService } from "@/lib/services/auth-service";
import { makeLoginSchema, type LoginFormValues } from "@/lib/schemas/auth-schema";
import { ApiError } from "@/lib/utils/api-error";
import { formatCountdown } from "@/lib/utils/format-duration";
import { useAuth } from "@/providers/AuthProvider";

export default function MoverLoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const { remainingSeconds, start: startLockout } = useCountdown();
  const isLocked = remainingSeconds > 0;
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
      const result = await authService.login({ role: "MOVER", ...values });
      await refetch();
      // 기사님은 프로필 등록 하드 게이트라 customer처럼 스킵 가능한 모달 없이 바로 보낸다.
      router.replace(result.hasProfile ? "/mover/requests" : "/mover/profile-register");
    } catch (error) {
      // rate limit 초과는 일반 로그인 실패와 별개로, 남은 시간을 보여주며 재시도 자체를 막는다.
      // retryAfterSeconds가 없거나 이상하면 카운트다운 없이 일반 에러 메시지로만 처리한다.
      const retryAfterSeconds = findRetryAfterSeconds(error);
      if (retryAfterSeconds !== null) {
        startLockout(retryAfterSeconds);
        return;
      }
      const message = error instanceof ApiError ? error.message : "로그인 중 문제가 발생했습니다.";
      setError("root", { message });
    }
  };

  return (
    <AuthCard
      mascotTabletSrc={truckMd}
      mascotPcSrc={truckLg}
      mascotTabletPositionClassName="-bottom-17 left-125.75"
      mascotPcPositionClassName="-bottom-13 left-170"
    >
      <AuthHeader prompt="일반 유저라면?" href="/customer/login" linkText="일반 유저 전용 페이지" />

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
                label="이메일"
                type="email"
                placeholder="이메일을 입력해 주세요"
                autoComplete="email"
                errorMessage={errors.email?.message}
                {...register("email")}
              />
              <FormField
                id="password"
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                autoComplete="current-password"
                errorMessage={errors.password?.message}
                {...register("password")}
              />
            </div>

            <AuthSubmitButton
              disabled={isSubmitting || !isValid || isLocked}
              errorMessage={
                isLocked
                  ? `${formatCountdown(remainingSeconds)} 후 다시 시도해주세요.`
                  : errors.root?.message
              }
            >
              로그인
            </AuthSubmitButton>
          </form>

          <AuthSwitchLink
            prompt="아직 무빙 회원이 아니신가요?"
            href="/mover/signup"
            linkText="이메일로 회원가입하기"
          />
        </div>

        <SocialLoginSection action="login" role="MOVER" />
      </div>
    </AuthCard>
  );
}
