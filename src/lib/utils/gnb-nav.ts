/** 현재 경로가 해당 메뉴인지 — 상세 페이지 등 하위 경로도 부모 메뉴를 active로 유지 */
export function isGnbNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** active는 검정 고정, 비활성은 호버 시 gray-400(#999) → gray-500(#808)로 살짝 짙게 */
export function getGnbNavColorClass(isActive: boolean): string {
  return isActive
    ? "text-black-500"
    : "text-gray-gray-400 transition-colors hover:text-gray-gray-500";
}
