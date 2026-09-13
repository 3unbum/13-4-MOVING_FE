import { type ReactNode } from "react";

// 가드는 상위 (auth)/layout.tsx가 담당 — 이 파일은 customer 전용 공통 UI 자리로 유지.
export default function CustomerAuthLayout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
