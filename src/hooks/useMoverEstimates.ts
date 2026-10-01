"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  MOVER_ESTIMATE_PAGE_SIZE,
  moverEstimateService,
  type MoverEstimate,
  type MoverEstimateStatus,
} from "@/lib/services/mover-estimate-service";

export const moverEstimateKeys = {
  list: (status: MoverEstimateStatus) => ["mover-estimates", "list", status] as const,
  detail: (id: number) => ["mover-estimates", "detail", id] as const,
};

/**
 * 상태별 커서 무한 조회.
 *
 * BE가 배열만 내려주고 `nextCursor`·총 개수를 주지 않아서, 마지막 항목의 `id`를
 * 커서로 쓰고 "받은 개수가 페이지 크기보다 적으면 끝"으로 판단합니다
 * (받은 요청 `useMoverRequests`와 같은 방식).
 *
 * 총 개수를 모르니 공용 `Pagination`(`totalPages`가 필요)은 쓸 수 없어 "더 보기"로 갑니다.
 */
function useEstimatePages(status: MoverEstimateStatus) {
  return useInfiniteQuery({
    queryKey: moverEstimateKeys.list(status),
    queryFn: ({ pageParam }) =>
      moverEstimateService.getList({ status, cursor: pageParam, take: MOVER_ESTIMATE_PAGE_SIZE }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      // 요청한 만큼 다 안 왔으면 마지막 페이지입니다
      if (lastPage.length < MOVER_ESTIMATE_PAGE_SIZE) return undefined;
      return lastPage.at(-1)?.id;
    },
  });
}

/**
 * 보낸 견적 조회 탭 — `PENDING`·`CONFIRMED`·`COMPLETED`를 함께 보여줍니다.
 *
 * `PENDING`은 확정 배지 없는 고객 견적 카드로 나옵니다(피그마 `1:9302`).
 * 이게 빠져 있어서 기사님이 보낸 견적을 확정 전까지 볼 수 없었습니다 (1차 QA-6).
 *
 * BE가 `status` 하나만 받아서 상태마다 부르고 합칩니다. 카드 종류가 달라서
 * (고객 견적 / 이사완료) 어차피 화면에서 상태를 봐야 하므로 합쳐도 무리가 없습니다.
 *
 * "더 보기"는 **아직 남은 쪽만** 부릅니다 — 끝난 쪽을 또 부르면 같은 커서로 빈 응답만
 * 받습니다. 배열을 합치면 BE의 `id desc` 순서가 깨져서 다시 세웁니다.
 */
export function useConfirmedEstimates() {
  const pending = useEstimatePages("PENDING");
  const confirmed = useEstimatePages("CONFIRMED");
  const completed = useEstimatePages("COMPLETED");
  const queries = [pending, confirmed, completed];

  const estimates = queries
    .flatMap((query) => query.data?.pages.flat() ?? [])
    .sort((a, b) => b.id - a.id);

  return {
    estimates,
    isPending: queries.some((query) => query.isPending),
    error: queries.find((query) => query.error)?.error ?? null,
    hasNextPage: queries.some((query) => query.hasNextPage),
    isFetchingNextPage: queries.some((query) => query.isFetchingNextPage),
    fetchNextPage: () => {
      queries.forEach((query) => {
        if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
      });
    },
  };
}

/** 반려 견적 탭 */
export function useRejectedEstimates() {
  const query = useEstimatePages("REJECTED");

  return {
    estimates: query.data?.pages.flat() ?? ([] as MoverEstimate[]),
    isPending: query.isPending,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
    },
  };
}

/** 견적 상세 (#34) */
export function useMoverEstimate(estimateId: number) {
  return useQuery({
    queryKey: moverEstimateKeys.detail(estimateId),
    queryFn: () => moverEstimateService.getById(estimateId),
    enabled: Number.isFinite(estimateId),
  });
}
