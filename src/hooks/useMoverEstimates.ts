"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
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

/** 확정 탭에 함께 들어가는 두 상태 — 확정됐고 이사 전 / 이사 끝남 */
const CONFIRMED_STATUSES = ["CONFIRMED", "COMPLETED"] as const;

function listQuery(status: MoverEstimateStatus) {
  return {
    queryKey: moverEstimateKeys.list(status),
    queryFn: () => moverEstimateService.getList({ status, take: MOVER_ESTIMATE_PAGE_SIZE }),
  };
}

/**
 * 확정 견적 탭 — `CONFIRMED`와 `COMPLETED`를 함께 보여줍니다.
 *
 * BE가 `status` 하나만 받아서 두 번 부르고 합칩니다. 카드 종류가 달라서
 * (고객 견적 / 이사완료) 어차피 화면에서 상태를 봐야 하므로 합쳐도 무리가 없습니다.
 *
 * 정렬은 최신순입니다 — BE가 `id desc`로 주는데, 두 배열을 합치면 그 순서가 깨져서
 * `id` 기준으로 다시 세웁니다.
 */
export function useConfirmedEstimates() {
  const results = useQueries({
    queries: CONFIRMED_STATUSES.map((status) => listQuery(status)),
  });

  const isPending = results.some((result) => result.isPending);
  const error = results.find((result) => result.error)?.error ?? null;
  const estimates = results.flatMap((result) => result.data ?? []).sort((a, b) => b.id - a.id);

  return { estimates, isPending, error };
}

/** 반려 견적 탭 */
export function useRejectedEstimates() {
  const query = useQuery(listQuery("REJECTED"));

  return {
    estimates: query.data ?? ([] as MoverEstimate[]),
    isPending: query.isPending,
    error: query.error,
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
