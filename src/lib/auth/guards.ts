import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findMyAccount } from "@/lib/auth/find-my-account";
import type { AccountResponse } from "@/lib/services/auth-service";

/**
 * `(protected)/{role}` 레이아웃 공통 가드. 비로그인 → loginPath, role 불일치 → "/".
 *
 * accessToken(1시간)만 만료되고 refreshToken(14일)이 남은 구간은 서버 컴포넌트가 쿠키를
 * 쓸 수 없어 여기서 갱신이 불가능하므로 통과시킨다(fail-open) — 페이지가 뜨면 클라이언트
 * `AuthProvider`의 `cookieFetch`가 401을 보고 refresh해 세션을 복구한다. 이 경우 계정
 * 정보를 알 수 없으므로 null을 반환한다.
 */
export async function requireRole(
  role: AccountResponse["role"],
  loginPath: string
): Promise<AccountResponse | null> {
  const account = await findMyAccount();

  if (!account) {
    const cookieStore = await cookies();
    if (cookieStore.has("refreshToken")) return null;
    redirect(loginPath);
  }
  if (account.role !== role) {
    redirect("/");
  }

  return account;
}
