"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

interface UseRoleGuardOptions {
  /** 이 레이아웃이 허용하는 role */
  role: "CUSTOMER" | "MOVER";
  /** 비로그인 상태로 접근 시 보낼 로그인 페이지 */
  loginPath: string;
  /**
   * 로그인은 했지만 hasProfile이 false일 때 보낼 프로필 등록 페이지.
   * 생략하면 프로필 미등록이어도 막지 않는다 (예: customer는 회원가입 직후 모달로만 유도하고 강제 게이트는 없음 — mover만 하드 게이트).
   */
  profileRegisterPath?: string;
  /** role이 다른 계정으로 접근했을 때 보낼 경로 (기본: 랜딩) */
  fallbackPath?: string;
}

/**
 * (protected) 그룹 공통 가드. 순서대로 검사한다:
 * 1. 비로그인 → loginPath
 * 2. role 불일치 → fallbackPath
 * 3. profileRegisterPath가 주어졌고, 로그인 O + hasProfile false + 지금 페이지가 profileRegisterPath가 아님 → profileRegisterPath로 강제 이동
 *    (이 체크가 없으면 프로필 미등록 상태로 받은요청 등 다른 protected 페이지에 그대로 접근 가능해짐)
 */
export function useRoleGuard({
  role,
  loginPath,
  profileRegisterPath,
  fallbackPath = "/",
}: UseRoleGuardOptions) {
  const { account, isLoading, authError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const needsProfile =
    !!profileRegisterPath && !!account && !account.hasProfile && pathname !== profileRegisterPath;

  useEffect(() => {
    if (isLoading || authError) return;

    if (!account) {
      router.replace(loginPath);
      return;
    }
    if (account.role !== role) {
      router.replace(fallbackPath);
      return;
    }
    if (needsProfile && profileRegisterPath) {
      router.replace(profileRegisterPath);
    }
  }, [
    account,
    isLoading,
    authError,
    role,
    loginPath,
    profileRegisterPath,
    fallbackPath,
    needsProfile,
    router,
  ]);

  const isChecking = isLoading || !account || account.role !== role || needsProfile;

  return { isChecking, authError };
}
