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
import { authService } from "@/lib/services/auth-service";
import { makeSignupSchema, type SignupFormValues } from "@/lib/schemas/auth-schema";
import { ApiError } from "@/lib/utils/api-error";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { useAuth } from "@/providers/AuthProvider";

export default function MoverSignupPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const t = useTranslations("auth");
  const tAuthError = useTranslations("authError");
  const tp = useTranslations("profile");
  const tValidation = useTranslations("validation");
  // 매 렌더마다 새 스키마가 생기면 zodResolver도 교체돼 폼이 불필요하게 다시 만들어집니다
  const schema = useMemo(() => makeSignupSchema(tValidation), [tValidation]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const onSubmit = async (values: SignupFormValues) => {
    const { passwordConfirm: _passwordConfirm, ...signupValues } = values;
    try {
      await authService.signup({ role: "MOVER", ...signupValues });
      // 회원가입 성공 시 BE가 로그인과 동일하게 토큰을 발급하므로 AuthProvider에도 반영되도록 refetch.
      await refetch();
      // 기사님은 프로필 등록 하드 게이트라, customer처럼 모달로 묻지 않고 바로 등록 페이지로 보낸다.
      router.replace("/mover/profile-register");
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS") {
        setError("email", { message: tAuthError("emailAlreadyExists") });
        return;
      }
      const message = toAuthErrorMessage(error, tAuthError, t("signupFailed"));
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
      <AuthHeader prompt={t("ifCustomer")} href="/customer/signup" linkText={t("customerPage")} />

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
                label={tp("name")}
                type="text"
                placeholder={tp("namePlaceholder")}
                autoComplete="name"
                errorMessage={errors.name?.message}
                {...register("name")}
              />
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
                id="phoneNumber"
                label={tp("phone")}
                type="tel"
                placeholder={tp("phonePlaceholder")}
                autoComplete="tel"
                errorMessage={errors.phoneNumber?.message}
                {...register("phoneNumber")}
              />
              <FormField
                id="password"
                label={tp("password")}
                type="password"
                placeholder={tp("passwordPlaceholder")}
                autoComplete="new-password"
                errorMessage={errors.password?.message}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                {...register("password", { deps: ["passwordConfirm"] })}
              />
              <FormField
                id="passwordConfirm"
                label={tp("passwordConfirm")}
                type="password"
                placeholder={tp("passwordConfirmPlaceholder")}
                autoComplete="new-password"
                errorMessage={errors.passwordConfirm?.message}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                {...register("passwordConfirm")}
              />
            </div>

            <AuthSubmitButton
              disabled={isSubmitting || !isValid}
              errorMessage={errors.root?.message}
            >
              {t("signupTitle")}
            </AuthSubmitButton>
          </form>

          <AuthSwitchLink
            prompt={t("alreadyMember")}
            href="/mover/login"
            linkText={t("loginTitle")}
          />
        </div>

        <SocialLoginSection action="signup" role="MOVER" />
      </div>
    </AuthCard>
  );
}
