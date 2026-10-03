import { AUTH_ERROR_CODES, type AuthErrorCode } from "@/constants/auth/error-codes";
import { ApiError } from "@/lib/utils/api-error";

/**
 * `messages/*.json`의 `authError` 네임스페이스 키.
 *
 * BE `ERROR_CODES` 34종 전부를 덮습니다 — 인증뿐 아니라 견적·리뷰·찜까지.
 * BE에 코드가 추가되면 `AUTH_ERROR_CODES` · 이 표 · `messages/*.json` 세 곳을 같이 채우세요.
 */
const MESSAGE_KEY_BY_CODE: Record<AuthErrorCode, string> = {
  // 인증 / 권한
  [AUTH_ERROR_CODES.UNAUTHORIZED]: "unauthorized",
  [AUTH_ERROR_CODES.FORBIDDEN]: "forbidden",
  [AUTH_ERROR_CODES.ACCESS_TOKEN_EXPIRED]: "accessTokenExpired",
  [AUTH_ERROR_CODES.ACCESS_TOKEN_INVALID]: "accessTokenInvalid",
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: "invalidCredentials",
  [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]: "emailAlreadyExists",
  [AUTH_ERROR_CODES.PROFILE_REQUIRED]: "profileRequired",
  [AUTH_ERROR_CODES.PROFILE_ALREADY_EXISTS]: "profileAlreadyExists",
  [AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED]: "refreshTokenExpired",
  [AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID]: "refreshTokenInvalid",
  [AUTH_ERROR_CODES.INVALID_OAUTH_CODE]: "invalidOauthCode",
  [AUTH_ERROR_CODES.OAUTH_PROVIDER_ERROR]: "oauthProviderError",
  [AUTH_ERROR_CODES.INVALID_OR_EXPIRED_SIGNUP_TOKEN]: "invalidOrExpiredSignupToken",
  [AUTH_ERROR_CODES.PROVIDER_ACCOUNT_ALREADY_LINKED]: "providerAccountAlreadyLinked",
  [AUTH_ERROR_CODES.OAUTH_EMAIL_REQUIRED]: "oauthEmailRequired",

  // 비밀번호 재설정
  [AUTH_ERROR_CODES.INVALID_RESET_CODE]: "invalidResetCode",
  [AUTH_ERROR_CODES.RESET_CODE_EXPIRED]: "resetCodeExpired",
  [AUTH_ERROR_CODES.RESET_CODE_ATTEMPTS_EXCEEDED]: "resetCodeAttemptsExceeded",
  [AUTH_ERROR_CODES.INVALID_OR_EXPIRED_RESET_TOKEN]: "invalidOrExpiredResetToken",

  // 견적 요청
  [AUTH_ERROR_CODES.ACTIVE_REQUEST_EXISTS]: "activeRequestExists",
  [AUTH_ERROR_CODES.NO_ACTIVE_REQUEST]: "noActiveRequest",
  [AUTH_ERROR_CODES.TARGET_LIMIT_EXCEEDED]: "targetLimitExceeded",
  [AUTH_ERROR_CODES.ALREADY_TARGETED]: "alreadyTargeted",

  // 견적
  [AUTH_ERROR_CODES.ESTIMATE_LIMIT_EXCEEDED]: "estimateLimitExceeded",
  [AUTH_ERROR_CODES.ALREADY_ESTIMATED]: "alreadyEstimated",
  [AUTH_ERROR_CODES.NOT_SERVICE_REGION]: "notServiceRegion",
  [AUTH_ERROR_CODES.ESTIMATE_ALREADY_PROCESSED]: "estimateAlreadyProcessed",

  // 리뷰 / 찜
  [AUTH_ERROR_CODES.REVIEW_ALREADY_CONFIRMED]: "reviewAlreadyConfirmed",
  [AUTH_ERROR_CODES.ALREADY_FAVORITED]: "alreadyFavorited",

  // 공통
  [AUTH_ERROR_CODES.VALIDATION_ERROR]: "validationError",
  [AUTH_ERROR_CODES.NOT_FOUND]: "notFound",
  [AUTH_ERROR_CODES.INTERNAL_ERROR]: "internalError",
  [AUTH_ERROR_CODES.TOO_MANY_REQUESTS]: "tooManyRequests",
  [AUTH_ERROR_CODES.BOT_CHECK_FAILED]: "botCheckFailed",
  [AUTH_ERROR_CODES.CONCURRENT_REQUEST_CONFLICT]: "concurrentRequestConflict",
};

const isAuthErrorCode = (code: string): code is AuthErrorCode =>
  Object.hasOwn(MESSAGE_KEY_BY_CODE, code);

/**
 * API 에러를 `authError` 네임스페이스의 번역 키로 바꾼다. 모르는 코드·네트워크 에러면 null —
 * 호출부가 화면에 맞는 기본 문구(loginFailed 등)로 대신한다.
 *
 * BE의 `error.message`는 한국어로 고정이라 그대로 보여주면 다른 언어 화면에도 한국어가 나와서,
 * 메시지 대신 코드를 보고 FE에서 번역한다.
 *
 *   const tError = useTranslations("authError");
 *   const key = findAuthErrorMessageKey(error);
 *   setError("root", { message: key ? tError(key) : t("loginFailed") });
 */
export function findAuthErrorMessageKey(error: unknown): string | null {
  if (!(error instanceof ApiError) || !isAuthErrorCode(error.code)) return null;
  return MESSAGE_KEY_BY_CODE[error.code];
}

/**
 * `findAuthErrorMessageKey` + 번역 + 폴백을 한 줄로 묶은 것. 호출부에서
 * `key ? tError(key) : fallback` 삼항을 반복하지 않으려고 둡니다.
 *
 * 폴백에는 **이미 번역된** 문구를 넘기세요. 번역이 없는 코드일 때 BE의 한국어
 * 원문이 아니라 그 화면의 기본 문구가 나와야 합니다.
 *
 *   const tError = useTranslations("authError");
 *   showToast(toAuthErrorMessage(error, tError, t("submitFailed")));
 */
export function toAuthErrorMessage(
  error: unknown,
  tError: (key: string) => string,
  fallback: string
): string {
  const key = findAuthErrorMessageKey(error);
  return key ? tError(key) : fallback;
}

/**
 * 번역이 **있을 때만** 문구를 돌려줍니다. 없으면 `null`.
 *
 * "목록을 불러오지 못했습니다 (이미 종료된 요청입니다)" 처럼 주 문구 뒤에 괄호로
 * 원인을 덧붙이는 자리에 씁니다. 폴백이 따로 없는 자리라서, 번역이 없으면
 * 괄호째로 생략해야 합니다 — 안 그러면 BE의 한국어 원문이 다른 언어 화면에 노출됩니다.
 */
export function toAuthErrorDetail(error: unknown, tError: (key: string) => string): string | null {
  const key = findAuthErrorMessageKey(error);
  return key ? tError(key) : null;
}
