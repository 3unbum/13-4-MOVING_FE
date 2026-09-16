import { cookieFetch } from "@/lib/utils/api-client";
import type { OAuthProviderKey } from "@/constants/auth/oauth";

export interface CustomerAccountResponse {
  userId: number;
  role: "CUSTOMER";
  name: string;
  email: string;
  phoneNumber: string;
  /** 프로필 등록 완료 여부 — false면 아래 프로필 필드는 비어있음 */
  hasProfile: boolean;
  image: string | null;
  region: string | null;
  services: string[];
}

export interface MoverAccountResponse {
  userId: number;
  role: "MOVER";
  name: string;
  email: string;
  phoneNumber: string;
  hasProfile: boolean;
  image: string | null;
  nickName: string | null;
  career: number | null;
  bio: string | null;
  description: string | null;
  avgRating: number | null;
  services: string[];
  regions: string[];
}

/** role을 모르는 쪽(AuthProvider 등)에서 쓰는 유니온 — `role` 필드로 좁힌다. */
export type AccountResponse = CustomerAccountResponse | MoverAccountResponse;

export type UserRole = "CUSTOMER" | "MOVER";

export interface SignupPayload {
  role: UserRole;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginPayload {
  role: UserRole;
  email: string;
  password: string;
}

export interface AuthResult {
  user: { id: number; role: UserRole; name: string; email: string };
  /** 가입 직후엔 항상 false. 로그인 응답에서만 실제 프로필 등록 여부를 반영한다. */
  hasProfile: boolean;
}

export interface OAuthLoginPayload {
  code: string;
  redirectUri: string;
  role: UserRole;
}

/**
 * 기존 회원이면 AuthResult와 동일한 모양(+isNewUser: false)으로 바로 로그인 처리된다.
 * 신규 회원이면 oauthSignupToken은 응답 바디가 아니라 httpOnly 쿠키로 내려온다 — FE는 값을 들고 있지 않는다.
 */
export type OAuthLoginResult =
  | ({ isNewUser: false } & AuthResult)
  | {
      isNewUser: true;
      providerProfile: {
        provider: string;
        email: string;
        name: string;
        profileImage: string | null;
      };
    };

export interface OAuthSignupPayload {
  phoneNumber: string;
}

export const authService = {
  /** 호출 전에 role을 몰라도 되는 유일한 계정 조회 — BE가 accessToken의 role로 분기해준다. */
  getMyAccount: () => cookieFetch<AccountResponse>("/auth/me"),

  logout: () => cookieFetch<void>("/auth/logout", { method: "POST" }),

  signup: (payload: SignupPayload) =>
    cookieFetch<AuthResult>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    cookieFetch<AuthResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** provider 콜백에서 받은 code를 넘긴다. 기존 회원이면 바로 로그인, 신규면 oauthSignupToken만 온다. */
  oauthLogin: (provider: OAuthProviderKey, payload: OAuthLoginPayload) =>
    cookieFetch<OAuthLoginResult>(`/auth/oauth/${provider}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  oauthSignup: (payload: OAuthSignupPayload) =>
    cookieFetch<AuthResult>("/auth/oauth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
