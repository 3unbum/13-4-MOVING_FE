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

// "지금 로그인한 사람 정보"를 가져오는 함수. AuthProvider 안에서도 쓰고, refetch로도 재사용한다.
async function fetchAccount(): Promise<AccountResponse | null> {
  // accessToken은 httpOnly 쿠키라 JS가 role을 읽을 수 없다. 그래서 role을 몰라도 부를 수 있는
  // /auth/me에 맡긴다 — BE가 토큰의 role로 분기해 알맞은 계정 정보를 돌려준다.
  try {
    return await authService.getMyAccount();
  } catch (error) {
    // /auth/me는 requireRole이 없어 403이 나지 않는다. 401 = 쿠키가 없거나 만료 = 비로그인.
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    // 그 외(네트워크 문제, 500 등)는 그대로 던져서 호출한 쪽에서 알 수 있게 한다
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountResponse | null>(null);
  // 처음엔 무조건 true로 시작 — "아직 로그인 여부를 확인 중"이라는 뜻. fetchAccount가 끝나야 false가 된다.
  const [isLoading, setIsLoading] = useState(true);

  // 앱이 처음 켜졌을 때 딱 한 번(deps가 []) 실행되는 effect: "지금 로그인 상태 확인"
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
