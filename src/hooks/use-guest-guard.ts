"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

/**
 * role별 로그인 후 기본 진입 경로.
 * mover는 프로필 하드 게이트가 있어 hasProfile false면 등록 페이지로 보낸다.
 * customer는 하드 게이트가 없어(회원가입 직후 모달로만 유도) hasProfile과 무관하게 랜딩으로 보낸다.
 */
function homePathFor(account: { role: "CUSTOMER" | "MOVER"; hasProfile: boolean }) {
  if (account.role === "CUSTOMER") {
    return "/";
  }
  return account.hasProfile ? "/mover/requests" : "/mover/profile-register";
}

/** (auth) 그룹 공통 가드 — 이미 로그인된 사용자가 로그인/회원가입 페이지에 접근하면 자기 role의 홈으로 보낸다 */
export function useGuestGuard() {
  const { account, isLoading, authError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || authError || !account) return;
    router.replace(homePathFor(account));
  }, [account, isLoading, authError, router]);

  return { isChecking: isLoading || !!account };
}
