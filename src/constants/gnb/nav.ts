export type GnbRole = "customer" | "mover";

export interface GnbNavItem {
  id: string;
  label: string;
  href: string;
}

export const CUSTOMER_NAV: GnbNavItem[] = [
  { id: "customer-quotation-requests", label: "견적 요청", href: "/customer/quotation-requests" },
  { id: "customer-movers", label: "기사님 찾기", href: "/movers" },
  { id: "customer-my-quotes", label: "내 견적 관리", href: "/customer/my-quotes" },
];

export const MOVER_NAV: GnbNavItem[] = [
  { id: "mover-requests", label: "받은 요청", href: "/mover/requests" },
  { id: "mover-my-quotes", label: "내 견적 관리", href: "/mover/my-quotes" },
];

export const LOGOUT_NAV: GnbNavItem[] = [
  { id: "guest-movers", label: "기사님 찾기", href: "/movers" },
];

export function getGnbNavItems(isLoggedIn: boolean, role: GnbRole): GnbNavItem[] {
  if (!isLoggedIn) return LOGOUT_NAV;
  return role === "mover" ? MOVER_NAV : CUSTOMER_NAV;
}
