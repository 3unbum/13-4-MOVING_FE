import { defineRouting } from "next-intl/routing";

/**
 * 다국어 라우팅 — 한국어·영어·중국어·일본어.
 *
 * 요구사항("심화 기능 요구사항")은 한·영·중 3종이고,
 * **일본어는 팀 요청으로 추가**했습니다.
 *
 * ⚠️ `localePrefix: "as-needed"` 가 핵심입니다.
 * MVP가 이미 배포된 상태라 기존 URL이 깨지면 안 됩니다.
 *
 *   /movers      → 한국어 (기존 URL 그대로)
 *   /en/movers   → 영어
 *   /zh/movers   → 중국어
 *   /ja/movers   → 일본어
 *
 * `"always"` 로 두면 기존 `/movers` 가 전부 `/ko/movers` 로 바뀌어
 * 공유된 링크·소셜 로그인 콜백·검색엔진 인덱스가 전부 깨집니다.
 *
 * 언어를 더 늘릴 때는 이 배열과 `LOCALE_LABELS`, `messages/{locale}.json`,
 * 그리고 `lib/utils/date.ts` 의 `DateLocale` 만 건드리면 됩니다.
 * 컴포넌트는 손댈 필요가 없습니다.
 */
export const routing = defineRouting({
  locales: ["ko", "en", "zh", "ja"],
  defaultLocale: "ko",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

/** 언어 선택 UI 표기 — 각 언어를 그 언어로 씁니다 */
export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
  ja: "日本語",
};
