import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * locale 협상과 rewrite를 담당합니다.
 *
 * ⚠️ 이게 없으면 `/movers` 가 `[locale]="movers"` 로 매칭돼 **전부 404** 가 납니다.
 * 폴더 이동과 반드시 같은 PR에 들어가야 하는 이유입니다.
 *
 * `localePrefix: "as-needed"` 라 한국어는 prefix 없이 들어오는데, 이때 proxy가
 * 내부적으로 `[locale]="ko"` 를 채워줍니다. 그래서 `i18n/request.ts` 의
 * `rootParams.locale()` 이 정상적으로 "ko" 를 반환합니다.
 */
export default createMiddleware(routing);

export const config = {
  // api·정적 파일은 제외 — `/api/kakao/address-search` 와 rewrites가 걸리면 안 됩니다
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
