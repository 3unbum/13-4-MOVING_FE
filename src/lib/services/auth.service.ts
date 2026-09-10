import { cookieFetch } from "@/lib/utils/api-client";

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

export const authService = {
  /**
   * 호출 전에 role을 몰라도 되는 유일한 계정 조회. BE가 accessToken의 role로 분기해준다.
   */
  getMyAccount: () => cookieFetch<AccountResponse>("/auth/me"),

  logout: () => cookieFetch<void>("/auth/logout", { method: "POST" }),
};
