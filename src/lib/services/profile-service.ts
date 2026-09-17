import { cookieFetch } from "@/lib/utils/api-client";
import type { CustomerAccountResponse } from "@/lib/services/auth-service";
import type {
  CustomerProfileFormValues,
  MoverProfileFormValues,
} from "@/lib/schemas/profile-schema";

export interface ProfileImageUploadResult {
  imageUrl: string;
}

export interface CustomerProfileResponse {
  id: number;
  userId: number;
  image: string | null;
  region: string;
  services: string[];
}

export interface MoverProfileResponse {
  id: number;
  userId: number;
  image: string | null;
  nickName: string;
  career: number;
  bio: string;
  description: string;
  services: string[];
  regions: string[];
}

// PATCH /profiles/customer 요청 바디 — BE customerProfileUpdateSchema와 동일(전부 optional).
// newPassword를 보낼 때만 currentPassword를 같이 실어 보낸다(폼의 newPasswordConfirm은 FE 검증
// 전용이라 여기 타입에 아예 없음).
export interface CustomerProfileUpdatePayload {
  name?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
  image?: string;
  region?: string;
  services?: string[];
}

export const profileService = {
  // multipart/form-data라 FormData로 보낸다 — api-client가 FormData면 Content-Type을 안 건드려준다
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return cookieFetch<ProfileImageUploadResult>("/profiles/image", {
      method: "POST",
      body: formData,
    });
  },

  registerCustomer: (payload: CustomerProfileFormValues) =>
    cookieFetch<CustomerProfileResponse>("/profiles/customer", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerMover: (payload: MoverProfileFormValues) =>
    cookieFetch<MoverProfileResponse>("/profiles/mover", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // GET /profiles/customer — /auth/me와 응답 타입이 동일(CustomerAccountResponse)한 계정+프로필 통합 조회.
  // 프로필 수정 페이지에서 서버 컴포넌트의 requireRole 결과(account)가 null인 예외 상황
  // (accessToken 만료 직후 fail-open 구간, guards.ts 주석 참고)에 클라이언트에서 다시 조회하는 용도.
  getCustomer: () => cookieFetch<CustomerAccountResponse>("/profiles/customer"),

  updateCustomer: (payload: CustomerProfileUpdatePayload) =>
    cookieFetch<CustomerAccountResponse>("/profiles/customer", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
