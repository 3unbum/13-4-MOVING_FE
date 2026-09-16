import { OAUTH_PROVIDER_CONFIG, type OAuthProviderKey } from "@/constants/auth/oauth";
import type { UserRole } from "@/lib/services/auth-service";

export function isOAuthProviderKey(value: string): value is OAuthProviderKey {
  return value in OAUTH_PROVIDER_CONFIG;
}

export function getOAuthRedirectUri(provider: OAuthProviderKey): string {
  return OAUTH_PROVIDER_CONFIG[provider].redirectUri;
}

const OAUTH_STATE_KEY = "oauthState";

/**
 * 인가 요청을 시작한 브라우저인지 콜백에서 대조하기 위한 1회용 nonce를 만들어 저장한다.
 * role을 state에 그대로 싣던 방식은 공격자도 콜백 링크를 만들 수 있어(로그인 CSRF) 저장소 대조로 바꿨다 —
 * role 역시 URL이 아니라 이 저장값에서 복원한다.
 */
export function createOAuthState(role: UserRole): string {
  const nonce = crypto.randomUUID();
  sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({ nonce, role }));
  return nonce;
}

/** 콜백에서 돌아온 state를 저장값과 대조한다. 일치하면 role을, 아니면 null을 반환. */
export function consumeOAuthState(state: string): UserRole | null {
  const saved = sessionStorage.getItem(OAUTH_STATE_KEY);
  // 1회용이라 대조 성공 여부와 무관하게 지운다 — 같은 state로 두 번 들어오는 경로를 남기지 않는다.
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  if (!saved) return null;

  const { nonce, role } = JSON.parse(saved) as { nonce: string; role: UserRole };
  return nonce === state ? role : null;
}

export function buildOAuthAuthorizeUrl(provider: OAuthProviderKey, state: string): string {
  const config = OAUTH_PROVIDER_CONFIG[provider];
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    state,
  });
  if (config.scope) params.set("scope", config.scope);

  return `${config.authorizeUrl}?${params.toString()}`;
}
