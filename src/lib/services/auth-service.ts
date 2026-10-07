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
  /** 소셜 로그인 계정이면 false(#131) — 비밀번호 변경 섹션 노출 여부를 이 값으로 가른다 */
  hasPassword: boolean;
  /** 최근 30분 이내 프로필 수정 이메일 인증을 통과했으면 true — 인증 화면을 건너뛴다 */
  isProfileEditVerified: boolean;
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
  /** 소셜 로그인 계정이면 false(#131) — 비밀번호 변경 섹션 노출 여부를 이 값으로 가른다 */
  hasPassword: boolean;
  /** 최근 30분 이내 프로필 수정 이메일 인증을 통과했으면 true — 인증 화면을 건너뛴다 */
  isProfileEditVerified: boolean;
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

export interface SignupCodePayload {
  role: UserRole;
  email: string;
  /** Turnstile 통과 토큰. BE에 TURNSTILE_SECRET_KEY가 있을 때만 필수 */
  turnstileToken?: string;
}

export interface VerifySignupCodePayload {
  role: UserRole;
  email: string;
  code: string;
}

export interface LoginPayload {
  role: UserRole;
  email: string;
  password: string;
  /** Turnstile 통과 토큰. BE에 TURNSTILE_SECRET_KEY가 있을 때만 필수 */
  turnstileToken?: string;
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

export interface FindEmailPayload {
  role: UserRole;
  name: string;
  phoneNumber: string;
}

export type FindEmailProvider = "LOCAL" | "GOOGLE" | "KAKAO" | "NAVER";

export interface FindEmailAccount {
  /** BE가 마스킹해서 내려준다 (예: ab***@naver.com) */
  email: string;
  provider: FindEmailProvider;
}

/** 일치하는 계정이 없어도 404가 아니라 빈 배열로 온다. LOCAL·소셜 계정이 함께 있으면 여러 건. */
export interface FindEmailResponse {
  accounts: FindEmailAccount[];
}

export interface PasswordResetCodePayload {
  role: UserRole;
  email: string;
}

export interface VerifyPasswordResetCodePayload extends PasswordResetCodePayload {
  code: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export const authService = {
  /** 호출 전에 role을 몰라도 되는 유일한 계정 조회 — BE가 accessToken의 role로 분기해준다. */
  getMyAccount: () => cookieFetch<AccountResponse>("/auth/me"),

  logout: () => cookieFetch<void>("/auth/logout", { method: "POST" }),

  /** 같은 (email, role)로 인증한 뒤 30분 안에만 가입된다 — 아니면 403 EMAIL_NOT_VERIFIED. */
  signup: (payload: SignupPayload) =>
    cookieFetch<AuthResult>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 비밀번호 재설정과 달리 가입 여부를 숨기지 않는다 — 이미 가입된 이메일이면 409 EMAIL_ALREADY_EXISTS. */
  sendSignupCode: (payload: SignupCodePayload) =>
    cookieFetch<void>("/auth/signup/code", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 성공하면 BE가 인증 시각만 기록한다(토큰·쿠키 없음) — 이후 signup 요청을 BE가 그 기록으로 확인한다. */
  verifySignupCode: (payload: VerifySignupCodePayload) =>
    cookieFetch<void>("/auth/signup/verify", {
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

  findEmail: (payload: FindEmailPayload) =>
    cookieFetch<FindEmailResponse>("/auth/find-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 가입 여부를 숨기려고 미가입·소셜 계정이어도 항상 204 — 성공 응답만으로 발송 여부를 알 수 없다. */
  sendPasswordResetCode: (payload: PasswordResetCodePayload) =>
    cookieFetch<void>("/auth/password-reset/code", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 성공하면 재설정 토큰이 응답 바디가 아니라 httpOnly 쿠키로 온다 — FE는 값을 들고 있지 않는다. */
  verifyPasswordResetCode: (payload: VerifyPasswordResetCodePayload) =>
    cookieFetch<void>("/auth/password-reset/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** verify에서 받은 재설정 토큰을 쿠키로 인증한다. 자동 로그인은 없어 성공 후 로그인 페이지로 보내야 한다. */
  resetPassword: (payload: ResetPasswordPayload) =>
    cookieFetch<void>("/auth/password-reset", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
