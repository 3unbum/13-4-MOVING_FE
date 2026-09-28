// BE `ERROR_CODES`와 동일한 값 — FE에서 분기 처리가 필요한 코드만 선별해서 둔다.
export const AUTH_ERROR_CODES = {
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
} as const;
