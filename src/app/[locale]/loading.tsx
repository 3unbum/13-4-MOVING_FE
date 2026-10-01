"use client";

// 클라이언트 컴포넌트(MoverRequestsClient, QuoteDetailClient)가 직접 렌더하므로
// async 서버 컴포넌트로 두면 안 됩니다 — 동기 + useTranslations를 씁니다.
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("page");

  return (
    <div
      role="status"
      aria-label={t("loadingLabel")}
      className="flex h-screen w-full items-center justify-center"
    >
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-orange-400 border-t-transparent" />
    </div>
  );
}
