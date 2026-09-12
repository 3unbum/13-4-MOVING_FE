import { type ReactNode } from "react";
import { requireRole } from "@/lib/auth/guards";

// customer는 mover와 달리 프로필 미등록이어도 하드 게이트 없음 — 회원가입 직후 모달로만 유도
export default async function CustomerProtectedLayout({ children }: { children: ReactNode }) {
  await requireRole("CUSTOMER", "/customer/login");

  return <div>{children}</div>;
}
