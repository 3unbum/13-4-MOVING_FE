/**
 * favorites 쿼리 키.
 * - list(): 전체 — 목록 카드 isFavorited용
 * - list(3): 사이드바
 * invalidateQueries({ queryKey: all })이면 둘 다 갱신됨
 */
export const favoriteQueryKeys = {
  all: ["favorites"] as const,
  list: (limit?: number) => [...favoriteQueryKeys.all, "list", { limit }] as const,
};
