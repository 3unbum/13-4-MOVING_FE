import { useState } from "react";
import { AUTH_ERROR_CODES } from "@/constants/auth/error-codes";
import { ApiError } from "@/lib/utils/api-error";

/**
 * 프로필 수정 이메일 인증 상태 — 계정 조회 응답의 isProfileEditVerified(BE가 최근 30분 이내 인증 여부를
 * 계산)를 기본값으로 쓰고, 이 화면에서 인증을 마쳤거나(true) 수정 중 403을 받았을 때(false)만 덮어쓴다.
 */
export function useProfileEditVerified(accountVerified: boolean | undefined) {
  const [override, setOverride] = useState<boolean>();
  return { isVerified: override ?? accountVerified ?? false, setVerified: setOverride };
}

/** 수정 요청이 "이메일 인증이 필요하다"(403)로 거절됐는지 */
export function isProfileEditVerificationRequiredError(error: unknown): boolean {
  return (
    error instanceof ApiError && error.code === AUTH_ERROR_CODES.PROFILE_EDIT_VERIFICATION_REQUIRED
  );
}
