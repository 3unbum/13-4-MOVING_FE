import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * 요청별 locale 결정과 메시지 로딩.
 *
 * locale 검증은 레이아웃이 아니라 **여기서** 합니다. `next.config.ts` 의
 * `createNextIntlPlugin()` 이 이 경로(`src/i18n/request.ts`)를 규약으로 찾습니다.
 *
 * `next/root-params` 는 Next.js 16.3 이상에서 기본 제공됩니다.
 */
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    } else {
      notFound();
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
