import { type ReactNode } from "react";
import Gnb from "@/components/layout/Gnb";

// 가드는 상위 (auth)/layout.tsx가 담당 — 이 파일은 customer 전용 공통 UI(로그인/회원가입 공통 Gnb) 자리.
export default function CustomerAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Gnb isLoggedIn={false} />
      {children}
    </div>
  );
}
