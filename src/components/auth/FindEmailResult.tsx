"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import type { OAuthProviderKey } from "@/constants/auth/oauth";
import type { FindEmailAccount, FindEmailProvider } from "@/lib/services/auth-service";

interface FindEmailResultProps {
  accounts: FindEmailAccount[];
  // 핸들러만 props로 받고 라우팅은 부모(FindEmailForm)가 소유 — 나중에 role별 API 응답을
  // accounts로 꽂아 넣을 때 이 컴포넌트는 그대로 두면 됨
  onRetry: () => void;
  onGoLogin: () => void;
  onGoSignup: () => void;
  onGoResetPassword: () => void;
  onSocialLogin: (provider: OAuthProviderKey) => void;
}

const SOCIAL_LABEL_KEY: Record<Exclude<FindEmailProvider, "LOCAL">, OAuthProviderKey> = {
  GOOGLE: "google",
  KAKAO: "kakao",
  NAVER: "naver",
};

export default function FindEmailResult({
  accounts,
  onRetry,
  onGoLogin,
  onGoSignup,
  onGoResetPassword,
  onSocialLogin,
}: FindEmailResultProps) {
  const t = useTranslations("auth");

  if (accounts.length === 0) {
    return (
      <div className="tablet:gap-10 flex w-full flex-col items-center gap-8">
        <p className="text-16 tablet:text-18 text-black-300 text-center font-medium">
          {t("findEmail.notFoundTitle")}
        </p>
        <div className="flex w-full gap-3">
          <Button variant="outlined" size="lg" onClick={onRetry}>
            {t("findEmail.retry")}
          </Button>
          <Button variant="solid" size="lg" onClick={onGoSignup}>
            {t("signupTitle")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tablet:gap-10 flex w-full flex-col gap-8">
      <p className="text-16 tablet:text-18 text-black-300 text-center font-medium">
        {t("findEmail.resultTitle")}
      </p>

      <ul className="border-line-100 divide-line-100 flex w-full flex-col divide-y rounded-2xl border">
        {accounts.map((account, index) => {
          const socialKey =
            account.provider === "LOCAL" ? null : SOCIAL_LABEL_KEY[account.provider];
          return (
            <li key={`${account.email}-${index}`} className="flex flex-col gap-3 p-5">
              <span className="text-16 tablet:text-18 text-black-black-400 font-semibold">
                {account.email}
              </span>
              {socialKey === null ? (
                <>
                  <p className="text-14 text-gray-400">{t("findEmail.localHint")}</p>
                  <div className="flex gap-3">
                    <Button variant="outlined" size="sm" onClick={onGoResetPassword}>
                      {t("findEmail.findPassword")}
                    </Button>
                    <Button variant="solid" size="sm" onClick={onGoLogin}>
                      {t("loginTitle")}
                    </Button>
                  </div>
                </>
              ) : (
                // 소셜 계정엔 비밀번호가 없어 재설정 메일이 오지 않으므로 비밀번호 찾기 대신 소셜 로그인만 둔다
                <>
                  <p className="text-14 text-gray-400">
                    {t("findEmail.socialHint", { provider: t(socialKey) })}
                  </p>
                  <Button variant="solid" size="sm" onClick={() => onSocialLogin(socialKey)}>
                    {t("socialAction", { provider: t(socialKey), action: t("login") })}
                  </Button>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <Button variant="outlined" size="lg" onClick={onRetry}>
        {t("findEmail.retry")}
      </Button>
    </div>
  );
}
