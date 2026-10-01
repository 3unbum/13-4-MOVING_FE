"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import avatarLg from "@/assets/images/common/avatartion_lg.png";
import avatarMd from "@/assets/images/common/avatartion_md.png";
import truckLg from "@/assets/images/common/truck_lg.png";
import truckMd from "@/assets/images/common/truck_md.png";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import FindEmailResult, { type FindEmailAccount } from "@/components/auth/FindEmailResult";
import FormField from "@/components/auth/FormField";
import type { UserRole } from "@/lib/services/auth-service";

interface FindEmailFormProps {
  role: UserRole;
}

// Figma 시안이 없는 페이지라 로그인 페이지의 마스코트 에셋·좌표(바닥 기준이라 카드 높이가
// 달라져도 깨지지 않음)를 그대로 재사용한다.
export default function FindEmailForm({ role }: FindEmailFormProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tp = useTranslations("profile");
  const isCustomer = role === "CUSTOMER";

  // null = 입력 화면, 배열(빈 배열 포함) = 결과 화면
  const [accounts, setAccounts] = useState<FindEmailAccount[] | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const otherRoleHref = isCustomer ? "/mover/find-email" : "/customer/find-email";
  const loginHref = isCustomer ? "/customer/login" : "/mover/login";
  const signupHref = isCustomer ? "/customer/signup" : "/mover/signup";
  const resetPasswordHref = isCustomer ? "/customer/reset-password" : "/mover/reset-password";

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    // TODO(logic): POST /auth/find-email { role, name, phoneNumber } 호출 후 응답
    // ({ email, provider }[])을 그대로 accounts에 담는다. 아래는 화면 확인용 데모(빈 배열).
    setAccounts([]);
  };

  const handleRetry = () => {
    setAccounts(null);
    setName("");
    setPhoneNumber("");
  };

  return (
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
          {t("findEmail.title")}
        </h1>

        {accounts === null ? (
          <form
            onSubmit={handleSubmit}
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
                value={name}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
              />
              <FormField
                id="phoneNumber"
                label={tp("phone")}
                type="tel"
                placeholder={tp("phonePlaceholder")}
                autoComplete="tel"
                value={phoneNumber}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setPhoneNumber(event.target.value)
                }
              />
            </div>
            {/* TODO(logic): react-hook-form + zod 연결 전까지는 항상 활성화 */}
            <AuthSubmitButton disabled={false}>{t("findEmail.title")}</AuthSubmitButton>
          </form>
        ) : (
          <FindEmailResult
            accounts={accounts}
            onRetry={handleRetry}
            onGoLogin={() => router.push(loginHref)}
            onGoSignup={() => router.push(signupHref)}
            onGoResetPassword={() => router.push(resetPasswordHref)}
          />
        )}
      </div>
    </AuthCard>
  );
}
