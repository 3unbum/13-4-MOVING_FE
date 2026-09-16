import { OAUTH_PROVIDER_CONFIG, type OAuthProviderKey } from "@/constants/auth/oauth";
import type { UserRole } from "@/lib/services/auth-service";

export function isOAuthProviderKey(value: string): value is OAuthProviderKey {
  return value in OAUTH_PROVIDER_CONFIG;
}

export function getOAuthRedirectUri(provider: OAuthProviderKey): string {
  return OAUTH_PROVIDER_CONFIG[provider].redirectUri;
}

/**
 * role은 로그인 전 상태(어느 페이지에서 눌렀는지)에서만 알 수 있고, 리다이렉트 왕복 뒤엔
 * useAuth().account로 읽을 방법이 없어 state 파라미터에 실어 보낸다 — provider가 콜백에 그대로 돌려준다.
 */
export function buildOAuthAuthorizeUrl(provider: OAuthProviderKey, role: UserRole): string {
  const config = OAUTH_PROVIDER_CONFIG[provider];
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    state: role,
  });
  if (config.scope) params.set("scope", config.scope);

  return `${config.authorizeUrl}?${params.toString()}`;
}
