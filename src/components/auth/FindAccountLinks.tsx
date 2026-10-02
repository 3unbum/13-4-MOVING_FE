"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { UserRole } from "@/lib/services/auth-service";

interface FindAccountLinksProps {
  role: UserRole;
}

// AuxText와 색은 같지만 태블릿 이상에서 한 단계 작게(20→18px) 보여야 해서 별도로 둔다.
// AuxText는 회원가입 유도·소셜 로그인 안내에서도 쓰여 크기를 바꾸면 그쪽까지 같이 바뀐다.
export default function FindAccountLinks({ role }: FindAccountLinksProps) {
  const t = useTranslations("auth");
  const basePath = role === "CUSTOMER" ? "/customer" : "/mover";

  return (
    <p className="tablet:text-18 text-black-100 tablet:text-black-200 text-12 flex items-center justify-center gap-1 whitespace-nowrap">
      <Link href={`${basePath}/find-email`} className="font-semibold text-orange-400 underline">
        {t("findEmail.title")}
      </Link>
      <span aria-hidden="true">|</span>
      <Link href={`${basePath}/reset-password`} className="font-semibold text-orange-400 underline">
        {t("findEmail.findPassword")}
      </Link>
    </p>
  );
}
