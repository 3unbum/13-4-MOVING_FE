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
 * 콜백에서 대조할 1회용 nonce를 만들어 role과 함께 저장한다. URL에는 nonce만 실어 보내고
 * role은 이 저장값에서 복원한다 — URL에 실으면 공격자도 콜백 링크를 만들 수 있다(로그인 CSRF).
 */
export function createOAuthState(role: UserRole): string {
  const nonce = crypto.randomUUID();
  sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({ nonce, role }));
  return nonce;
}

/** 콜백에서 돌아온 state를 저장값과 대조한다. 일치하면 role을, 아니면 null을 반환. */
export function consumeOAuthState(state: string): UserRole | null {
  const saved = sessionStorage.getItem(OAUTH_STATE_KEY);
  // 1회용이라 대조 성공 여부와 무관하게 지운다.
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
