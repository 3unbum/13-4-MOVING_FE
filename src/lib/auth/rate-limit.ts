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

// 비밀번호 재설정 인증번호 발송의 계정별 제한 중 시간당 제한의 창 길이(BE rateLimit.ts와 동일)
const HOURLY_WINDOW_SECONDS = 60 * 60;

/**
 * 인증번호 발송이 하루 제한(10회)에 걸렸으면 풀릴 때까지 남은 시간을 시간 단위(올림)로, 아니면 null.
 *
 * 429 응답은 시간당·하루 제한의 코드와 메시지가 같아 남은 시간으로만 구분할 수 있다 —
 * 시간당 제한은 최대 1시간이라, 그보다 길면 하루 제한이다. 몇 시간짜리를 mm:ss로 세면
 * "840:12"처럼 읽기 어려워 이때는 대략적인 시간만 보여준다.
 */
export function findDailyLimitHours(retryAfterSeconds: number): number | null {
  if (retryAfterSeconds <= HOURLY_WINDOW_SECONDS) return null;
  return Math.ceil(retryAfterSeconds / HOURLY_WINDOW_SECONDS);
}
