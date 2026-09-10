"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type AccountResponse } from "@/lib/services/auth.service";
import { ApiError } from "@/lib/utils/api-error";

interface AuthContextValue {
  account: AccountResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** 현재 로그인한 계정 정보를 조회한다. accessToken은 httpOnly라 role을 몰라도 되는 /auth/me에 맡긴다. */
async function fetchAccount(): Promise<AccountResponse | null> {
  try {
    return await authService.getMyAccount();
  } catch (error) {
    // /auth/me는 requireRole이 없어 403이 나지 않는다 — 401만 "비로그인"으로 처리한다.
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    // 네트워크 오류·500 등은 호출한 쪽이 구분할 수 있도록 그대로 던진다.
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountResponse | null>(null);
  // fetchAccount가 끝나기 전까지는 "로그인 여부 확인 중"이므로 true로 시작한다.
  const [isLoading, setIsLoading] = useState(true);

  // 앱 최초 마운트 시 한 번만 로그인 상태를 확인한다.
  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const result = await fetchAccount();
        if (!cancelled) setAccount(result);
      } catch (error) {
        console.error("계정 정보를 불러오지 못했습니다", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  /** 로그인/프로필 변경 직후처럼 계정 상태를 다시 확인해야 할 때 호출한다. */
  const refetch = async () => {
    setIsLoading(true);
    try {
      setAccount(await fetchAccount());
    } finally {
      setIsLoading(false);
    }
  };

  //로그아웃 응답이 느릴때에 대한 UX적인 개선필요
  const logout = async () => {
    try {
      await authService.logout(); // BE에 쿠키 삭제 요청
    } finally {
      setAccount(null);
    }
  };

  const value: AuthContextValue = {
    account,
    isLoading,
    isAuthenticated: !!account,
    refetch,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다");
  }
  return context;
}
