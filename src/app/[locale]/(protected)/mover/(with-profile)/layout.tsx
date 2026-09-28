import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";

// 괄호 폴더라 URL에는 안 드러남 — /mover/requests 등은 그대로 /mover/requests.
// profile-register는 이 그룹 밖에 있어서, 여기서 리다이렉트해도 무한루프가 안 난다.
export default async function MoverWithProfileLayout({ children }: { children: ReactNode }) {
  const account = await requireRole("MOVER", "/mover/login");

  // fail-open(accessToken 만료 + refreshToken 생존) 상태 — hasProfile을 모르니 통과시키고
  // 클라이언트 AuthProvider의 refresh 이후 판단에 맡긴다.
  if (!account) return <>{children}</>;

  if (!account.hasProfile) {
    redirect("/mover/profile-register");
  }

  return <>{children}</>;
}
