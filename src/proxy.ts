import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * (protected) 그룹 1차 필터. 쿠키 존재 여부만 보고 BE 호출 없이 비로그인 요청을 걷어낸다 —
 * role/hasProfile 같은 세부 판단은 그대로 각 레이아웃의 findMyAccount()가 담당한다.
 * accessToken(1시간)만 만료되고 refreshToken(14일)이 남은 정상 세션까지 튕기면 안 되므로,
 * 둘 다 없을 때만 로그인으로 보낸다.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("accessToken") || request.cookies.has("refreshToken");
  if (hasSession) return NextResponse.next();

  const loginPath = request.nextUrl.pathname.startsWith("/mover/")
    ? "/mover/login"
    : "/customer/login";
  return NextResponse.redirect(new URL(loginPath, request.url));
}

export const config = {
  // (auth)의 login/signup은 로그인 여부와 무관하게 접근 가능해야 하므로 매처에서 제외
  // (안 그러면 비로그인 사용자가 로그인 페이지 자체에서 로그인 페이지로 리다이렉트되는 루프가 생김).
  matcher: ["/customer/((?!login|signup).*)", "/mover/((?!login|signup).*)"],
};
