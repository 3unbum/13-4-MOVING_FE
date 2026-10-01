export type OAuthProviderKey = "google" | "kakao" | "naver";

export interface OAuthProviderConfig {
  authorizeUrl: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
}

// client_secret은 서버 대 서버 토큰 교환에만 필요해 BE에만 둔다 — client_id/redirect_uri는 공개돼도 안전
export const OAUTH_PROVIDER_CONFIG: Record<OAuthProviderKey, OAuthProviderConfig> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? "",
    scope: "openid email profile",
  },
  kakao: {
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? "",
    redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? "",
  },
  naver: {
    authorizeUrl: "https://nid.naver.com/oauth2.0/authorize",
    clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? "",
    redirectUri: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI ?? "",
  },
};
