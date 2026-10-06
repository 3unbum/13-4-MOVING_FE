import { AUTH_ERROR_CODES, type AuthErrorCode } from "@/constants/auth/error-codes";
import { ApiError } from "@/lib/utils/api-error";

/** `messages/*.json`의 `authError` 네임스페이스 키 */
const MESSAGE_KEY_BY_CODE: Record<AuthErrorCode, string> = {
  [AUTH_ERROR_CODES.TOO_MANY_REQUESTS]: "tooManyRequests",
  [AUTH_ERROR_CODES.INVALID_RESET_CODE]: "invalidResetCode",
  [AUTH_ERROR_CODES.RESET_CODE_EXPIRED]: "resetCodeExpired",
  [AUTH_ERROR_CODES.RESET_CODE_ATTEMPTS_EXCEEDED]: "resetCodeAttemptsExceeded",
  [AUTH_ERROR_CODES.INVALID_OR_EXPIRED_RESET_TOKEN]: "invalidOrExpiredResetToken",
  [AUTH_ERROR_CODES.INVALID_PROFILE_EDIT_CODE]: "invalidProfileEditCode",
  [AUTH_ERROR_CODES.PROFILE_EDIT_CODE_EXPIRED]: "profileEditCodeExpired",
  [AUTH_ERROR_CODES.PROFILE_EDIT_CODE_ATTEMPTS_EXCEEDED]: "profileEditCodeAttemptsExceeded",
};

const isAuthErrorCode = (code: string): code is AuthErrorCode =>
  Object.hasOwn(MESSAGE_KEY_BY_CODE, code);

/**
 * 인증 API 에러를 `authError` 네임스페이스의 번역 키로 바꾼다. 모르는 코드·네트워크 에러면 null —
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
