"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import avatarLg from "@/assets/images/common/avatartion_lg.png";
import avatarMd from "@/assets/images/common/avatartion_md.png";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthSwitchLink from "@/components/auth/AuthSwitchLink";
import FormField from "@/components/auth/FormField";
import ProfileRegisterModal from "@/components/auth/ProfileRegisterModal";
import SignupEmailVerification, {
  type SignupEmailStatus,
} from "@/components/auth/SignupEmailVerification";
import SocialLoginSection from "@/components/auth/SocialLoginSection";
import { AUTH_ERROR_CODES } from "@/constants/auth/error-codes";
import { authService } from "@/lib/services/auth-service";
import { makeSignupSchema, type SignupFormValues } from "@/lib/schemas/auth-schema";
import { ApiError } from "@/lib/utils/api-error";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { useAuth } from "@/providers/AuthProvider";

export default function CustomerSignupPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
    clearErrors,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({ resolver: zodResolver(schema), mode: "onChange" });
  // 인증이 끝나야 가입 버튼이 열린다. 인증 후 이메일이 바뀌면 BE가 403을 주므로 idle이 아니면 입력란을 잠근다
  const [emailStatus, setEmailStatus] = useState<SignupEmailStatus>("idle");
  // 발송 중에 고친 이메일에 이전 주소의 발송 결과가 적용되지 않게, 응답이 올 때까지 입력란을 잠근다
  const [isEmailSending, setIsEmailSending] = useState(false);
  const email = useWatch({ control, name: "email" }) ?? "";

  const handleEmailStatusChange = (status: SignupEmailStatus) => {
    setEmailStatus(status);
    // 403(인증 만료) 안내는 다시 인증하면 더 이상 맞지 않는 문구라 지운다
    if (status === "verified") clearErrors("root");
  };

  const onSubmit = async (values: SignupFormValues) => {
    const { passwordConfirm: _passwordConfirm, ...signupValues } = values;
    try {
      await authService.signup({ role: "CUSTOMER", ...signupValues });
      // 회원가입 성공 시 BE가 로그인과 동일하게 토큰을 발급하므로, AuthProvider(루트에서 마운트 시 1회만
      // 조회)에도 반영되도록 refetch — 안 하면 이후 페이지에서 useAuth()가 계속 비로그인 상태로 남는다.
      await refetch();
      // 가입 직후엔 hasProfile이 항상 false — 바로 등록시키지 않고 모달로 물어본다.
      setIsProfileModalOpen(true);
    } catch (error) {
      // 인증 후 30분이 지났으면 인증번호부터 다시 받아야 한다 — 이메일 입력란을 풀고 인증 영역을 처음으로 되돌린다
      if (error instanceof ApiError && error.code === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED) {
        // 이메일 필드가 아니라 root에 둔다 — 필드 에러가 남아 있으면 인증번호 받기 버튼(canRequest)이 막힌다
        setEmailStatus("idle");
        setError("root", { message: tAuthError("emailNotVerified") });
        return;
      }
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS") {
        setError("email", { message: tAuthError("emailAlreadyExists") });
        return;
      }
      const message = toAuthErrorMessage(error, tAuthError, t("signupFailed"));
      setError("root", { message });
    }
  };

  // 모달을 닫는 모든 경로는 랜딩으로 — 비로그인 전용 (auth) 그룹에 로그인된 채로 남지 않게 하기 위함.
  const skipProfileRegister = () => router.replace("/");

  return (
    <>
      <AuthCard
        mascotTabletSrc={avatarMd}
        mascotPcSrc={avatarLg}
        mascotTabletPositionClassName="-bottom-19.5 left-125.75"
        mascotPcPositionClassName="-bottom-8.5 left-170"
      >
        <AuthHeader prompt={t("ifMover")} href="/mover/signup" linkText={t("moverPage")} />

        {/* login과 동일 이유(자세한 설명은 login/page.tsx 참고) — header↔content 40px, content↔social 48px 분리 */}
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
                  readOnly={emailStatus !== "idle" || isEmailSending}
                  {...register("email")}
                />
                <SignupEmailVerification
                  role="CUSTOMER"
                  email={email}
                  canRequest={Boolean(email) && !errors.email}
                  status={emailStatus}
                  onStatusChange={handleEmailStatusChange}
                  onSendingChange={setIsEmailSending}
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
                  // RHF는 바뀐 필드만 재검증하므로, password 변경 시 passwordConfirm의 일치 검사도 다시 돌리려면 필요
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
                disabled={isSubmitting || !isValid || emailStatus !== "verified"}
                errorMessage={errors.root?.message}
              >
                {t("signupTitle")}
              </AuthSubmitButton>
            </form>

            <AuthSwitchLink
              prompt={t("alreadyMember")}
              href="/customer/login"
              linkText={t("loginTitle")}
            />
          </div>

          <SocialLoginSection action="signup" role="CUSTOMER" />
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
