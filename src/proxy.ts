import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * locale 협상과 rewrite. 이게 없으면 `/movers` 가 `[locale]="movers"` 로 매칭돼
 * **전부 404** 가 납니다. 폴더 이동과 같은 PR에 들어가야 하는 이유입니다.
 *
 * `localePrefix: "as-needed"` 라 한국어는 prefix 없이 들어오는데, 이때 내부적으로
 * `[locale]="ko"` 를 채워줍니다. 그래서 `i18n/request.ts` 의 `rootParams.locale()`
 * 이 "ko" 를 반환합니다.
 */
const handleI18n = createMiddleware(routing);

/**
 * 경로에서 언어 prefix를 떼어냅니다.
 *
 * 다국어 도입으로 `(protected)` 경로 앞에 `/en`·`/zh` 가 붙을 수 있게 됐습니다.
 * 이걸 떼지 않으면 `/en/customer/my-quotes` 가 인증 체크를 통과해버립니다.
 */
function splitLocale(pathname: string): { prefix: string; rest: string } {
  const [, maybeLocale, ...segments] = pathname.split("/");
  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    return { prefix: `/${maybeLocale}`, rest: `/${segments.join("/")}` };
  }
  return { prefix: "", rest: pathname };
}

/**
 * `(protected)` 그룹 1차 필터. 쿠키 존재 여부만 보고 BE 호출 없이 비로그인 요청을
 * 걷어낸다 — role/hasProfile 같은 세부 판단은 그대로 각 레이아웃의
 * `findMyAccount()` 가 담당한다.
 * accessToken(1시간)만 만료되고 refreshToken(14일)이 남은 정상 세션까지 튕기면
 * 안 되므로, 둘 다 없을 때만 로그인으로 보낸다.
 *
 * ⚠️ 인증 체크를 **먼저** 하고, 통과한 요청만 i18n으로 넘깁니다.
 * 순서가 바뀌면 리다이렉트 대상까지 locale rewrite를 거쳐 경로가 꼬입니다.
 */
export function proxy(request: NextRequest) {
  const { prefix, rest } = splitLocale(request.nextUrl.pathname);
  const isProtected =
    /^\/customer\/(?!login|signup)/.test(rest) || /^\/mover\/(?!login|signup)/.test(rest);

  if (isProtected) {
    const hasSession = request.cookies.has("accessToken") || request.cookies.has("refreshToken");
    if (!hasSession) {
      // 로그인 경로에도 현재 언어를 유지합니다 (`/en/customer/...` → `/en/customer/login`)
      const loginPath = rest.startsWith("/mover/") ? "/mover/login" : "/customer/login";
      return NextResponse.redirect(new URL(`${prefix}${loginPath}`, request.url));
    }
  }

  return handleI18n(request);
}

export const config = {
  // api·정적 파일 제외 — `/api/kakao/address-search` 에 rewrites가 걸리면 안 됩니다.
  // i18n rewrite가 모든 페이지에 필요하므로 매처를 전체로 넓히고,
  // 인증 체크 대상은 위 `isProtected` 에서 가립니다.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
