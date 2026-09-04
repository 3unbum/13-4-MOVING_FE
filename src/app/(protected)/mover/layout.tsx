import { type PropsWithChildren } from "react";

export default function MoverProtectedLayout({ children }: PropsWithChildren) {
  // TODO: 세션 체크 + role !== "mover"면 리다이렉트 (인증 로직 구현 후 추가)
  return <div>{children}</div>;
}
