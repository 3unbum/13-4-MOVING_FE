import type { MoverListSort } from "@/lib/services/mover-service";

/**
 * 목록 infinite query 필터.
 * cursor는 pageParam이라 여기 넣지 않는다 (넣으면 페이지마다 key가 갈라짐).
 */
export type MoverListFilters = {
  keyword?: string;
  region?: string;
  service?: string;
  sort: MoverListSort;
  limit?: number;
};

/**
 * movers 쿼리 키 팩토리.
 * - list(filters): 필터별 캐시 분리
 * - lists()/all: invalidate 시 prefix로 묶을 때 사용
 */
export const moverQueryKeys = {
  all: ["movers"] as const,
  lists: () => [...moverQueryKeys.all, "list"] as const,
  list: (filters: MoverListFilters) => [...moverQueryKeys.lists(), filters] as const,
  reviews: (moverId: number) => [...moverQueryKeys.all, "reviews", moverId] as const,
  reviewList: (moverId: number, page: number) =>
    [...moverQueryKeys.reviews(moverId), "list", page] as const,
  reviewDistribution: (moverId: number) =>
    [...moverQueryKeys.reviews(moverId), "distribution"] as const,
};
