"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";
import { makeNewPasswordSchema, type NewPasswordFormValues } from "@/lib/schemas/auth-schema";

interface NewPasswordStepProps {
  // 변경 성공 후 로그인 페이지로 넘어가기 전까지 다시 제출하지 못하게 막는다 (재설정 토큰은 1회용)
  isCompleted: boolean;
  // 실패하면 화면에 보여줄 문구를 돌려준다 (성공이면 undefined)
  onSubmit: (newPassword: string) => Promise<string | undefined>;
}

// 회원가입 페이지의 비밀번호 필드와 동일한 모양(onCopy/onCut 방지 포함).
export default function NewPasswordStep({ isCompleted, onSubmit }: NewPasswordStepProps) {
  const t = useTranslations("auth");
  const tp = useTranslations("profile");
  const tValidation = useTranslations("validation");
  const schema = useMemo(() => makeNewPasswordSchema(tValidation), [tValidation]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<NewPasswordFormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const submit = async (values: NewPasswordFormValues) => {
    const errorMessage = await onSubmit(values.newPassword);
    if (errorMessage) setError("root", { message: errorMessage });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="tablet:gap-8 flex w-full flex-col gap-6"
      noValidate
    >
      <div className="tablet:gap-6 flex flex-col gap-4">
        <FormField
          id="newPassword"
          label={tp("newPassword")}
          type="password"
          placeholder={tp("newPasswordPlaceholder")}
          autoComplete="new-password"
          errorMessage={errors.newPassword?.message}
          onCopy={(event) => event.preventDefault()}
          onCut={(event) => event.preventDefault()}
          {...register("newPassword", { deps: ["newPasswordConfirm"] })}
        />
        <FormField
          id="newPasswordConfirm"
          label={tp("newPasswordConfirm")}
          type="password"
          placeholder={tp("newPasswordConfirmPlaceholder")}
          autoComplete="new-password"
          errorMessage={errors.newPasswordConfirm?.message}
          onCopy={(event) => event.preventDefault()}
          onCut={(event) => event.preventDefault()}
          {...register("newPasswordConfirm")}
        />
      </div>

      <AuthSubmitButton
        disabled={isSubmitting || !isValid || isCompleted}
        errorMessage={errors.root?.message}
      >
        {t("resetPassword.submitNewPassword")}
      </AuthSubmitButton>
    </form>
  );
}
