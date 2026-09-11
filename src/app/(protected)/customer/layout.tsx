"use client";

import { type ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";

export default function CustomerProtectedLayout({ children }: { children: ReactNode }) {
  // customer는 mover와 달리 프로필 미등록이어도 하드 게이트 없음 — 회원가입 직후 모달로만 유도
  const { isChecking, authError } = useRoleGuard({
    role: "CUSTOMER",
    loginPath: "/customer/login",
  });

  if (authError) return <div>계정 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.</div>;
  if (isChecking) return null;

  return <div>{children}</div>;
}
