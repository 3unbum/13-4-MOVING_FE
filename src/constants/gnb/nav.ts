export type GnbRole = "customer" | "mover";

export interface GnbNavItem {
  id: string;
  label: string;
  href: string;
}

/**
 * ⚠️ `label`은 **폴백**입니다. 화면 표기는 `messages/*.json`의 `gnb.nav.{id}`를 씁니다.
 *
 * `support`(고객센터)는 **세 배열 모두**에 들어갑니다. 로그인 여부·역할과 무관하게
 * 누구나 필요한 메뉴라서입니다. 푸터에는 개인정보 처리방침만 남겼습니다(송현규님 리뷰).
 */
export const CUSTOMER_NAV: GnbNavItem[] = [
  { id: "customer-quotation-requests", label: "견적 요청", href: "/customer/quotation-requests" },
  { id: "customer-movers", label: "기사님 찾기", href: "/movers" },
  { id: "customer-my-quotes", label: "내 견적 관리", href: "/customer/my-quotes" },
  { id: "support", label: "고객센터", href: "/support" },
];

export const MOVER_NAV: GnbNavItem[] = [
  { id: "mover-requests", label: "받은 요청", href: "/mover/requests" },
  { id: "mover-my-quotes", label: "내 견적 관리", href: "/mover/my-quotes" },
  { id: "support", label: "고객센터", href: "/support" },
];

export const LOGOUT_NAV: GnbNavItem[] = [
  { id: "guest-movers", label: "기사님 찾기", href: "/movers" },
  { id: "support", label: "고객센터", href: "/support" },
];

export function getGnbNavItems(isLoggedIn: boolean, role: GnbRole): GnbNavItem[] {
  if (!isLoggedIn) return LOGOUT_NAV;
  return role === "mover" ? MOVER_NAV : CUSTOMER_NAV;
}
