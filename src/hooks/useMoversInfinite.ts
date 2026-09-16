"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { MOVER_LIST_PAGE_SIZE } from "@/constants/movers/filters";
import { moverQueryKeys, type MoverListFilters } from "@/constants/query-keys/movers";
import { moverService } from "@/lib/services/mover-service";

/**
 * 기사님 목록 커서 무한 스크롤.
 * filters가 바뀌면 queryKey가 바뀌어 1페이지부터 다시 불러온다.
 */
export function useMoversInfinite(filters: MoverListFilters) {
  const listParams = {
    keyword: filters.keyword,
    region: filters.region,
    service: filters.service,
    sort: filters.sort,
    limit: filters.limit ?? MOVER_LIST_PAGE_SIZE,
  };

  return useInfiniteQuery({
    queryKey: moverQueryKeys.list(listParams),
    // pageParam = 직전 응답의 nextCursor (첫 요청은 undefined)
    queryFn: ({ pageParam }) =>
      moverService.getList({
        ...listParams,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    // hasNext가 false거나 nextCursor가 없으면 더 이상 fetch하지 않음
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });
}
