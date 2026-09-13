import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { AccountResponse } from "@/lib/services/auth-service";

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * 서버 컴포넌트 전용 계정 조회. `cookieFetch`(클라이언트용)는 상대경로 `/api/...`를 호출해
 * Next rewrites의 도움을 받는데, 서버 fetch는 브라우저가 없어 rewrites를 안 타므로 BE를
 * 직접 호출하고 쿠키를 수동으로 실어 보낸다. 401 등 실패는 전부 null(비로그인)로 취급 —
 * accessToken 만료 시 갱신은 클라이언트 `AuthProvider`(`cookieFetch`)가 담당한다.
 */
export const findMyAccount = cache(async (): Promise<AccountResponse | null> => {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${BACKEND_ORIGIN}/api/auth/me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as AccountResponse;
  } catch {
    return null;
  }
});
