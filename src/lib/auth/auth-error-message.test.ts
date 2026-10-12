import { describe, expect, it } from "vitest";
import { AUTH_ERROR_CODES } from "@/constants/auth/error-codes";
import { ApiError } from "@/lib/utils/api-error";
import {
  findAuthErrorMessageKey,
  toAuthErrorDetail,
  toAuthErrorMessage,
} from "./auth-error-message";

/**
 * BE 에러 코드 → 번역 키 매핑 테스트.
 *
 * BE의 `error.message`는 한국어로 고정이라, 다른 언어 화면에 한국어가 새어 나가지 않도록
 * FE가 코드를 보고 번역합니다. 그래서 **코드 하나라도 매핑이 비면 그 화면만 한국어**가 됩니다.
 *
 * 코드가 늘어날 때 같이 채워야 하는 곳이 세 군데입니다
 * (`AUTH_ERROR_CODES` · `MESSAGE_KEY_BY_CODE` · `messages/*.json`).
 * 아래 전수 검사가 앞의 둘을 고정합니다 — 코드만 늘리고 매핑을 빠뜨리면 실패합니다.
 *
 * `messages/*.json`에 문구가 실제로 있는지까지는 여기서 보지 않습니다. `messages/`가
 * `src/` 밖이라 `@/` 별칭이 닿지 않고, 상대경로 import는 린트 규칙이 막습니다.
 * 번역이 비면 빌드의 `MISSING_MESSAGE`로 드러납니다.
 */

const apiError = (code: string) => new ApiError(400, { code, message: "BE가 주는 한국어 원문" });

describe("findAuthErrorMessageKey", () => {
  it("알려진 코드는 번역 키를 돌려준다", () => {
    expect(findAuthErrorMessageKey(apiError(AUTH_ERROR_CODES.UNAUTHORIZED))).toBe("unauthorized");
    expect(findAuthErrorMessageKey(apiError(AUTH_ERROR_CODES.INVALID_CREDENTIALS))).toBe(
      "invalidCredentials"
    );
    expect(findAuthErrorMessageKey(apiError(AUTH_ERROR_CODES.DEPOSIT_EXPIRED))).toBe(
      "depositExpired"
    );
  });

  it("모르는 코드는 null", () => {
    expect(findAuthErrorMessageKey(apiError("SOMETHING_NEW_FROM_BE"))).toBeNull();
  });

  // 네트워크 끊김·JSON 파싱 실패 등은 ApiError가 아닙니다.
  it("ApiError가 아니면 null", () => {
    expect(findAuthErrorMessageKey(new Error("Network request failed"))).toBeNull();
    expect(findAuthErrorMessageKey(null)).toBeNull();
    expect(findAuthErrorMessageKey(undefined)).toBeNull();
    expect(findAuthErrorMessageKey("INVALID_CREDENTIALS")).toBeNull();
  });

  it("코드 전부에 번역 키가 있다", () => {
    const missing = Object.values(AUTH_ERROR_CODES).filter(
      (code) => findAuthErrorMessageKey(apiError(code)) === null
    );
    expect(missing).toEqual([]);
  });

  // 키가 중복되면 서로 다른 코드가 같은 문구를 쓰게 됩니다. 의도한 경우가 아직 없어
  // 전부 고유해야 합니다.
  it("번역 키가 코드마다 고유하다", () => {
    const keys = Object.values(AUTH_ERROR_CODES).map((code) =>
      findAuthErrorMessageKey(apiError(code))
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("toAuthErrorMessage", () => {
  const tError = (key: string) => `번역(${key})`;

  it("알려진 코드는 번역한 문구", () => {
    expect(toAuthErrorMessage(apiError(AUTH_ERROR_CODES.FORBIDDEN), tError, "기본 문구")).toBe(
      "번역(forbidden)"
    );
  });

  // BE 원문("BE가 주는 한국어 원문")이 아니라 호출부 기본 문구가 나와야 합니다.
  it("모르는 코드는 폴백 — BE의 한국어 원문이 새어 나가지 않는다", () => {
    const result = toAuthErrorMessage(apiError("UNKNOWN"), tError, "기본 문구");
    expect(result).toBe("기본 문구");
    expect(result).not.toContain("BE가 주는");
  });
});

describe("toAuthErrorDetail", () => {
  const tError = (key: string) => `번역(${key})`;

  it("알려진 코드는 번역한 문구", () => {
    expect(toAuthErrorDetail(apiError(AUTH_ERROR_CODES.NOT_FOUND), tError)).toBe("번역(notFound)");
  });

  // 폴백이 없는 자리(괄호 보조 설명)라, 없으면 괄호째 생략해야 합니다.
  it("모르는 코드는 null", () => {
    expect(toAuthErrorDetail(apiError("UNKNOWN"), tError)).toBeNull();
    expect(toAuthErrorDetail(new Error("boom"), tError)).toBeNull();
  });
});
