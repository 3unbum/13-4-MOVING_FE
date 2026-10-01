/** 시·군·구가 없는 단층 광역시 — 다음 토큰이 도로명이라 붙이면 안 됩니다 */
const SINGLE_TIER_CITIES = ["세종"];

/**
 * 카드·요약 영역에 쓸 주소 축약 — "서울특별시 중구 삼일대로 343" → "서울시 중구".
 *
 * BE는 전체 주소를 주는데 피그마는 시·구까지만 보여줍니다.
 *
 * 행정구역 명칭이 제각각이라 단순히 앞 두 토큰을 자를 수 없습니다.
 *   - `특별시`·`광역시` → `시`로 줄임 (서울특별시 → 서울시)
 *   - `도`로 끝나면 그대로 (경기도 수원시)
 *   - `특별자치시`·`특별자치도`는 이름 자체가 행정구역이라 그대로 둠
 *   - 세종은 시·군·구가 없어 두 번째 토큰이 도로명입니다 — 붙이면 "세종 한누리대로"가 됩니다
 */
export function shortenAddress(address: string) {
  const tokens = address.trim().split(/\s+/);
  const first = tokens[0];
  if (!first) return "";

  // "세종특별자치시"도 접두어로 걸러냅니다
  if (SINGLE_TIER_CITIES.some((city) => first.startsWith(city))) return first;

  // 특별자치시·특별자치도는 줄이면 다른 지역명이 됩니다 (강원특별자치도 → 강원시 ✗)
  const isSelfGoverning = first.includes("특별자치");
  const isProvince = first.endsWith("도");
  const city = isProvince || isSelfGoverning ? first : first.replace(/(특별시|광역시)/, "시");

  return tokens[1] ? `${city} ${tokens[1]}` : city;
}
