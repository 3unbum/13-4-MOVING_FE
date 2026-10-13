"use client";

// 클라이언트 컴포넌트(MoverRequestsClient, QuoteDetailClient)가 직접 렌더하므로
// async 서버 컴포넌트로 두면 안 됩니다 — 동기 + useTranslations를 씁니다.
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

// className은 화면 전체가 아닌 좁은 영역(채팅 창 등) 안에서 쓸 때 높이를 덮어쓰는 용도 — 기본은 전체 화면
export default function Loading({ className }: { className?: string }) {
  const t = useTranslations("page");

  return (
    <div
      role="status"
      aria-label={t("loadingLabel")}
      className={cn("flex w-full items-center justify-center", className ?? "h-screen")}
    >
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-orange-400 border-t-transparent" />
    </div>
  );
}
