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
 * 정보를 알 수 없으므로 null을 반환한다. 실제 데이터 접근은 BE의 모든 보호 API가
 * requireAuth/requireRole/requireProfile로 막고 있어, 무효한 refreshToken으로 이 통과를
 * 지나가도 데이터는 내려가지 않는다 — 여긴 UX용 1차 안내일 뿐.
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

/**
 * 페이지 단위 hasProfile 하드 게이트. `requireRole` 뒤에 이어 호출 — 그룹 전체에 걸 필요
 * 없이 특정 페이지 몇 개에만 걸 때(예: customer의 내견적/프로필수정) 페이지 컴포넌트에서
 * 직접 호출한다. 그룹 전체(profile-register 제외 전부)에 걸어야 하면 `(with-profile)`
 * 하위 레이아웃(mover 참고)을 쓰는 쪽이 낫다 — 페이지마다 반복 호출 안 해도 됨.
 * `account`가 null(위 fail-open 구간)이면 hasProfile을 알 수 없으니 통과시킨다.
 */
export function requireProfile(account: AccountResponse | null, redirectPath: string): void {
  if (account && !account.hasProfile) {
    redirect(redirectPath);
  }
}
