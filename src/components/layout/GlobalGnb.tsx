"use client";

import { useRouter } from "next/navigation";
import Gnb from "@/components/layout/Gnb";
import { useAuth } from "@/providers/AuthProvider";

// RootLayout(서버 컴포넌트)은 useAuth를 직접 못 써서, 실제 로그인 상태를 Gnb(순수 프레젠테이션)에
// 주입해주는 클라이언트 경계. Gnb 자체는 컴포넌트 쇼케이스(app/(main)/components/gnb)에서도
// 독립적으로 쓰이므로 계속 props 기반으로 둔다.
export default function GlobalGnb() {
  const router = useRouter();
  const { account, isAuthenticated, logout } = useAuth();

  const handleProfileSelect = (value: string) => {
    if (value !== "logout") return;
    logout();
    router.push("/");
  };

  return (
    <Gnb
      isLoggedIn={isAuthenticated}
      role={account?.role === "MOVER" ? "mover" : "customer"}
      userName={account?.name}
      onLoginClick={() => router.push("/customer/login")}
      onProfileSelect={handleProfileSelect}
    />
  );
}
