import { AUTH_ERROR_CODES } from "@/constants/auth/error-codes";
import { ApiError } from "@/lib/utils/api-error";

/**
 * 로그인 rate limit(429) 에러면 잠금 해제까지 남은 초를, 아니거나 값이 이상하면 null을 반환한다.
 */
export function findRetryAfterSeconds(error: unknown): number | null {
  if (!(error instanceof ApiError) || error.code !== AUTH_ERROR_CODES.TOO_MANY_REQUESTS) {
    return null;
  }
  // 공용 ApiErrorBody에 로그인 전용 필드를 넣지 않으려고, 응답 원본에서 `in`으로 확인해 꺼낸다.
  if (!("retryAfterSeconds" in error.body)) return null;
  const { retryAfterSeconds } = error.body;
  return typeof retryAfterSeconds === "number" && retryAfterSeconds > 0 ? retryAfterSeconds : null;
}
