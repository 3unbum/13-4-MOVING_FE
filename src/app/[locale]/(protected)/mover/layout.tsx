import { type ReactNode } from "react";
import { requireRole } from "@/lib/auth/guards";

// hasProfile 하드 게이트는 여기가 아니라 (with-profile) 레이아웃이 담당 — 이 레이아웃이
// 하면 profile-register까지 감싸게 돼서 등록 페이지로 리다이렉트해도 다시 걸린다(무한루프).
export default async function MoverProtectedLayout({ children }: { children: ReactNode }) {
  await requireRole("MOVER", "/mover/login");

  return <div>{children}</div>;
}
