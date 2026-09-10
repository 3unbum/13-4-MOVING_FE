import { ApiError } from "@/lib/utils/api-error";

function rawFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

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

// 여러 요청이 동시에 401을 맞아도 /auth/refresh는 한 번만 나가도록, 진행 중인 refresh를 공유한다. 동작을 100% 신뢰 할 수는 없어 MVP구현 단계에서는 유지하나 이 후 개선의 여지가 있음 (BFF 패턴 적용 하면 필요없어짐)
let pendingRefresh: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await rawFetch("/auth/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  } finally {
    pendingRefresh = null;
  }
}

function refreshAccessToken(): Promise<boolean> {
  if (!pendingRefresh) {
    pendingRefresh = doRefresh();
  }
  return pendingRefresh;
}

/**
 * `/api`는 same-origin으로 BE에 프록시되는 경로를 가정한다 (SameSite=Lax httpOnly 쿠키가
 * cross-origin fetch에는 실리지 않으므로, next.config.ts의 rewrites 설정이 선행되어야 함).
 */
export async function cookieFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await rawFetch(path, init);

  // /auth/* 요청의 401은 "accessToken 만료"가 아니라 로그인 실패·refreshToken 무효 같은
  // 다른 의미라서 재시도 대상에서 제외한다 (안 그러면 무한 루프 위험도 있음).
  // 단 /auth/me는 예외 — 얘의 401은 진짜 accessToken 만료라서, 제외해버리면 refresh 한 번이면
  // 살아날 세션을 그냥 비로그인으로 처리하게 된다.
  const isAuthPath = path.startsWith("/auth/") && path !== "/auth/me";

  if (res.status === 401 && !isAuthPath) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await rawFetch(path, init); // 새 accessToken으로 원래 요청 한 번만 재시도
    }
  }

  return parseResponse<T>(res);
}

/**
 * 로그인 여부와 무관하게 볼 수 있는 공개 데이터 조회용 — 쿠키를 안 실어 보내므로 401
 * 재시도(refresh) 로직이 필요 없다. 캐싱 여부는 호출하는 쪽에서 `init.cache`로 지정한다.
 */
export async function defaultFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  return parseResponse<T>(res);
}
