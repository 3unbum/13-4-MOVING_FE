"use client";

import { useTranslations } from "next-intl";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";

interface NewPasswordStepProps {
  errorMessage?: string;
  onSubmit: (password: string, passwordConfirm: string) => void;
}

// 표시 전용 — 입력값만 내부 useState, 제출 시 최종 값을 그대로 onSubmit으로 올려보낸다.
// 회원가입 페이지의 비밀번호 필드와 동일한 모양(onCopy/onCut 방지 포함).
export default function NewPasswordStep({ errorMessage, onSubmit }: NewPasswordStepProps) {
  const t = useTranslations("auth");
  const tp = useTranslations("profile");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit(password, passwordConfirm);
  };

  return (
    <form onSubmit={handleSubmit} className="tablet:gap-8 flex w-full flex-col gap-6" noValidate>
      <div className="tablet:gap-6 flex flex-col gap-4">
        <FormField
          id="newPassword"
          label={tp("newPassword")}
          type="password"
          placeholder={tp("newPasswordPlaceholder")}
          autoComplete="new-password"
          value={password}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          onCopy={(event) => event.preventDefault()}
          onCut={(event) => event.preventDefault()}
        />
        <FormField
          id="newPasswordConfirm"
          label={tp("newPasswordConfirm")}
          type="password"
          placeholder={tp("newPasswordConfirmPlaceholder")}
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setPasswordConfirm(event.target.value)
          }
          onCopy={(event) => event.preventDefault()}
          onCut={(event) => event.preventDefault()}
        />
      </div>

      {/* TODO(logic): react-hook-form + zod(비밀번호 일치 등) 연결 전까지는 항상 활성화 */}
      <AuthSubmitButton disabled={false} errorMessage={errorMessage}>
        {t("resetPassword.submitNewPassword")}
      </AuthSubmitButton>
    </form>
  );
}
