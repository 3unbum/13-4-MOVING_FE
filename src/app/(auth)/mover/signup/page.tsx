"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import truckLg from "@/assets/images/common/truck_lg.png";
import truckMd from "@/assets/images/common/truck_md.png";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthSwitchLink from "@/components/auth/AuthSwitchLink";
import FormField from "@/components/auth/FormField";
import SocialLoginSection from "@/components/auth/SocialLoginSection";
import { authService } from "@/lib/services/auth-service";
import { signupSchema, type CustomerSignupFormValues } from "@/lib/schemas/auth-schema";
import { ApiError } from "@/lib/utils/api-error";
import { useAuth } from "@/providers/AuthProvider";

export default function MoverSignupPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CustomerSignupFormValues>({ resolver: zodResolver(signupSchema), mode: "onChange" });

  const onSubmit = async (values: CustomerSignupFormValues) => {
    const { passwordConfirm: _passwordConfirm, ...signupValues } = values;
    try {
      await authService.signup({ role: "MOVER", ...signupValues });
      // 회원가입 성공 시 BE가 로그인과 동일하게 토큰을 발급하므로 AuthProvider에도 반영되도록 refetch.
      await refetch();
      // 기사님은 프로필 등록 하드 게이트라, customer처럼 모달로 묻지 않고 바로 등록 페이지로 보낸다.
      router.replace("/mover/profile-register");
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS") {
        setError("email", { message: error.message });
        return;
      }
      const message =
        error instanceof ApiError ? error.message : "회원가입 중 문제가 발생했습니다.";
      setError("root", { message });
    }
  };

  return (
    <AuthCard
      mascotTabletSrc={truckMd}
      mascotPcSrc={truckLg}
      mascotTabletPositionClassName="-bottom-18 left-125.75"
      mascotPcPositionClassName="-bottom-8.5 left-170"
    >
      <AuthHeader
        prompt="일반 유저라면?"
        href="/customer/signup"
        linkText="일반 유저 전용 페이지"
      />

      <div className="flex w-full flex-col gap-12">
        <div className="tablet:gap-6 flex w-full flex-col gap-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="tablet:gap-8 flex w-full flex-col gap-6"
            noValidate
          >
            <div className="tablet:gap-6 flex flex-col gap-4">
              <FormField
                id="name"
                label="이름"
                type="text"
                placeholder="이름을 입력해 주세요"
                autoComplete="name"
                errorMessage={errors.name?.message}
                {...register("name")}
              />
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
                id="phoneNumber"
                label="전화번호"
                type="tel"
                placeholder="하이픈(-) 없이 숫자만 입력해 주세요"
                autoComplete="tel"
                errorMessage={errors.phoneNumber?.message}
                {...register("phoneNumber")}
              />
              <FormField
                id="password"
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                autoComplete="new-password"
                errorMessage={errors.password?.message}
                {...register("password", { deps: ["passwordConfirm"] })}
              />
              <FormField
                id="passwordConfirm"
                label="비밀번호 확인"
                type="password"
                placeholder="비밀번호 다시 한번 입력해 주세요"
                autoComplete="new-password"
                errorMessage={errors.passwordConfirm?.message}
                {...register("passwordConfirm")}
              />
            </div>

            <AuthSubmitButton
              disabled={isSubmitting || !isValid}
              errorMessage={errors.root?.message}
            >
              회원가입
            </AuthSubmitButton>
          </form>

          <AuthSwitchLink
            prompt="이미 무빙 회원이신가요?"
            href="/mover/login"
            linkText="로그인하기"
          />
        </div>

        <SocialLoginSection actionLabel="회원가입" />
      </div>
    </AuthCard>
  );
}
