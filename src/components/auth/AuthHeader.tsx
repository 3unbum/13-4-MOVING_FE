// 부모(로그인·회원가입 4개 페이지)가 전부 "use client"라 이미 클라이언트 번들에 있었습니다.
// 번역 훅을 쓰려고 지시어만 명시합니다 — 렌더 방식이 바뀌지는 않습니다.
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import logoTextXl from "@/assets/images/common/logo-text-xl.svg";
import AuthSwitchLink from "@/components/auth/AuthSwitchLink";

interface AuthHeaderProps {
  prompt: string;
  href: string;
  linkText: string;
}

export default function AuthHeader({ prompt, href, linkText }: AuthHeaderProps) {
  const t = useTranslations("auth");
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Link href="/" aria-label={t("home")} className="shrink-0">
        <Image src={logoTextXl} alt={t("logoAlt")} className="tablet:h-20 h-16 w-auto" priority />
      </Link>
      <AuthSwitchLink prompt={prompt} href={href} linkText={linkText} />
    </div>
  );
}
