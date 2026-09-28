import { defineRouting } from "next-intl/routing";

/**
 * 다국어 라우팅 — 한국어·영어·중국어 (요구사항 "심화 기능 요구사항").
 *
 * ⚠️ `localePrefix: "as-needed"` 가 핵심입니다.
 * MVP가 이미 배포된 상태라 기존 URL이 깨지면 안 됩니다.
 *
 *   /movers      → 한국어 (기존 URL 그대로)
 *   /en/movers   → 영어
 *   /zh/movers   → 중국어
 *
 * `"always"` 로 두면 기존 `/movers` 가 전부 `/ko/movers` 로 바뀌어
 * 공유된 링크·소셜 로그인 콜백·검색엔진 인덱스가 전부 깨집니다.
 */
export const routing = defineRouting({
  locales: ["ko", "en", "zh"],
  defaultLocale: "ko",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

/** 언어 선택 UI 표기 — 각 언어를 그 언어로 씁니다 */
export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
};
