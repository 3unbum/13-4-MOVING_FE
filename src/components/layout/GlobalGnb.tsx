"use client";

import { useRouter } from "next/navigation";
import Gnb from "@/components/layout/Gnb";
import {
  GNB_HOME_PATH,
  GNB_LOGIN_PATH,
  GNB_PROFILE_PATHS,
  isGnbProfilePathAction,
} from "@/constants/gnb/profile";
import { useAuth } from "@/providers/AuthProvider";

// RootLayout(서버 컴포넌트)은 useAuth를 직접 못 써서, 실제 로그인 상태를 Gnb(순수 프레젠테이션)에
// 주입해주는 클라이언트 경계. Gnb 자체는 컴포넌트 쇼케이스(app/(main)/components/gnb)에서도
// 독립적으로 쓰이므로 계속 props 기반으로 둔다.
export default function GlobalGnb() {
  const router = useRouter();
  const { account, isAuthenticated, logout } = useAuth();

  const handleProfileSelect = async (value: string) => {
    if (isGnbProfilePathAction(value)) {
      router.push(GNB_PROFILE_PATHS[value]);
      return;
    }

    if (value !== "logout") return;

    try {
      await logout();
      router.push(GNB_HOME_PATH);
    } catch (error) {
      // 네트워크 오류·5xx — 로그아웃 실패, 현재 화면 유지 (성공 시에만 이동)
      console.error("로그아웃에 실패했어요", error);
    }
  };

  return (
    <Gnb
      isLoggedIn={isAuthenticated}
      role={account?.role === "MOVER" ? "mover" : "customer"}
      userName={account?.name}
      onLoginClick={() => router.push(GNB_LOGIN_PATH)}
      onProfileSelect={handleProfileSelect}
    />
  );
}
