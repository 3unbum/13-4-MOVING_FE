"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FormField from "@/components/auth/FormField";
import type { UserRole } from "@/lib/services/auth-service";

interface ResetEmailStepProps {
  // 소셜 가입 안내문 안의 "아이디 찾기" 링크가 role별로 다른 경로를 가리켜야 해서 필요
  role: UserRole;
  errorMessage?: string;
  onSubmit: (email: string) => void;
}

// 표시 전용 — 값(email)은 이 단계에서만 쓰는 임시 입력이라 내부 useState로 들고 있고,
// 제출 시점의 최종 값만 onSubmit으로 올려보낸다 (부모는 단계 전환·타이머만 소유).
export default function ResetEmailStep({ role, errorMessage, onSubmit }: ResetEmailStepProps) {
  const t = useTranslations("auth");
  const tp = useTranslations("profile");
  const [email, setEmail] = useState("");
  const findEmailHref = role === "CUSTOMER" ? "/customer/find-email" : "/mover/find-email";

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="tablet:gap-8 flex w-full flex-col gap-6" noValidate>
      <FormField
        id="email"
        label={tp("email")}
        type="email"
        placeholder={tp("emailPlaceholder")}
        autoComplete="email"
        value={email}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
      />

      <div className="flex flex-col gap-1">
        <p className="text-13 tablet:text-14 text-gray-400">{t("resetPassword.guideNotice")}</p>
        <p className="text-13 tablet:text-14 text-gray-400">
          {t.rich("resetPassword.guideSocialRich", {
            link: (chunks) => (
              <Link href={findEmailHref} className="font-semibold text-orange-400 underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>

      {/* TODO(logic): react-hook-form + zod 연결 전까지는 항상 활성화 */}
      <AuthSubmitButton disabled={false} errorMessage={errorMessage}>
        {t("resetPassword.requestCode")}
      </AuthSubmitButton>
    </form>
  );
}
