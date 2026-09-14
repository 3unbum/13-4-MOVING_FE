"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { authService } from "@/lib/services/auth-service";
import { loginSchema, type CustomerLoginFormValues } from "@/lib/schemas/auth-schema";
import { ApiError } from "@/lib/utils/api-error";
import { useAuth } from "@/providers/AuthProvider";

// TODO: 로그인 전 페이지로 복귀는 미구현 — 호출부들이 ?redirect=를 넘기기 시작할 때 useSearchParams(+Suspense)로 추가.
export default function CustomerLoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CustomerLoginFormValues>({ resolver: zodResolver(loginSchema), mode: "onChange" });

  const onSubmit = async (values: CustomerLoginFormValues) => {
    try {
      const result = await authService.login({ role: "CUSTOMER", ...values });
      await refetch();
      // customer는 프로필이 선택사항이라 강제 이동은 안 시키고, 아직 등록 안 한 계정에만 모달로 유도한다.
      if (result.hasProfile) {
        router.push("/");
      } else {
        setIsProfileModalOpen(true);
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "로그인 중 문제가 발생했습니다.";
      setError("root", { message });
    }
  };

  const skipProfileRegister = () => router.push("/");

  return (
    <>
      <AuthCard mascotTabletSrc={avatarMd} mascotPcSrc={avatarLg}>
        <AuthHeader prompt="기사님이신가요?" href="/mover/login" linkText="기사님 전용 페이지" />

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
                disabled={isSubmitting || !isValid}
                errorMessage={errors.root?.message}
              >
                로그인
              </AuthSubmitButton>
            </form>

            <AuthSwitchLink
              prompt="아직 무빙 회원이 아니신가요?"
              href="/customer/signup"
              linkText="이메일로 회원가입하기"
            />
          </div>

          <SocialLoginSection actionLabel="로그인" />
        </div>
      </AuthCard>

      <ProfileRegisterModal
        open={isProfileModalOpen}
        onSkip={skipProfileRegister}
        onRegister={() => router.push("/customer/profile-register")}
      />
    </>
  );
}
