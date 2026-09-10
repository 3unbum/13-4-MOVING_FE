import { ApiError } from "@/lib/utils/api-error";

/** `cookieFetch`/`defaultFetch`가 공유하는 밑바탕 fetch — 쿠키 포함 여부(`withCredentials`)만 다르게 받는다. */
function baseFetch(path: string, init?: RequestInit, withCredentials = true): Promise<Response> {
  return fetch(`/api${path}`, {
    ...init,
    ...(withCredentials && { credentials: "include" }),
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

/** 응답 파싱을 한 곳에 모음 — 204는 undefined, 실패는 ApiError로 던지고, 성공이면 `data`만 꺼낸다. */
async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, json.error);
  }

  return json.data as T;
}

// 동시에 여러 요청이 401을 맞아도 /auth/refresh는 한 번만 나가도록 진행 중인 refresh를 공유한다.
let pendingRefresh: Promise<boolean> | null = null;

/** refresh 요청 한 번을 실제로 수행하고 성공 여부만 반환한다. */
async function doRefresh(): Promise<boolean> {
  try {
    const res = await baseFetch("/auth/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  } finally {
    pendingRefresh = null;
  }
}

/**
 * 동시에 여러 요청이 401을 맞아도 refresh를 각자 쏘지 않도록 진행 중인 refresh를 공유한다.
 * 완벽한 동기화는 아니라 MVP 단계에서만 유지 — BFF 패턴 도입 시 이 로직 자체가 불필요해진다.
 */
function refreshAccessToken(): Promise<boolean> {
  if (!pendingRefresh) {
    pendingRefresh = doRefresh();
  }
  return pendingRefresh;
}

/**
 * 인증이 필요한 요청용. `/api`가 same-origin으로 BE에 프록시된다고 가정하며(SameSite=Lax
 * httpOnly 쿠키는 cross-origin fetch에 안 실리므로 next.config.ts의 rewrites가 선행돼야 함),
 * 401을 받으면 refresh를 한 번 시도한 뒤 원요청을 한 번만 재시도한다.
 */
export async function cookieFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await baseFetch(path, init);

  // /auth/* 요청의 401은 "토큰 만료"가 아니라 로그인 실패·refreshToken 무효 등 다른 의미라
  // 재시도 대상에서 제외한다. 단 /auth/me만 예외 — 얘의 401은 진짜 accessToken 만료라서,
  // 제외하면 refresh 한 번이면 살아날 세션을 비로그인으로 처리해버린다.
  const isAuthPath = path.startsWith("/auth/") && path !== "/auth/me";

  if (res.status === 401 && !isAuthPath) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await baseFetch(path, init); // 새 accessToken으로 원요청 한 번만 재시도
    }
  }

  return parseResponse<T>(res);
}

/**
 * 로그인 여부와 무관한 공개 데이터 조회용. 쿠키를 안 실어 보내므로 401 재시도(refresh)가
 * 필요 없다. 캐싱은 호출하는 쪽에서 `init.cache`로 지정한다.
 */
export async function defaultFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await baseFetch(path, init, false);
  return parseResponse<T>(res);
}
