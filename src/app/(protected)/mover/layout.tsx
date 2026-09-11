"use client";

import { type ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";

export default function MoverProtectedLayout({ children }: { children: ReactNode }) {
  const { isChecking, authError } = useRoleGuard({
    role: "MOVER",
    loginPath: "/mover/login",
    profileRegisterPath: "/mover/profile-register",
  });

  if (authError) return <div>계정 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.</div>;
  if (isChecking) return null;

  return <div>{children}</div>;
}
