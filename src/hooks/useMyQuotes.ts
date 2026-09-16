"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { ESTIMATE_LIMIT_PER_REQUEST, estimateService } from "@/lib/services/estimate-service";
import {
  ACTIVE_QUOTATION_STATUSES,
  quotationRequestService,
} from "@/lib/services/quotation-request-service";

export const myQuotesKeys = {
  activeRequest: ["quotation-requests", "active"] as const,
  pendingEstimates: ["estimates", "pending"] as const,
  requestHistory: ["quotation-requests", "history"] as const,
  requestEstimates: (requestId: number) => ["estimates", "by-request", requestId] as const,
};

/** 대기 중인 견적 탭 — 활성 요청(SubHeader용)과 거기 달린 견적을 함께 가져옵니다 */
export function usePendingQuotes() {
  const activeRequest = useQuery({
    queryKey: myQuotesKeys.activeRequest,
    queryFn: () => quotationRequestService.getActive(),
  });

  const estimates = useQuery({
    queryKey: myQuotesKeys.pendingEstimates,
    queryFn: () => estimateService.getPending({ take: ESTIMATE_LIMIT_PER_REQUEST }),
    // 활성 요청이 없으면 견적도 있을 수 없어 호출을 아낍니다
    enabled: Boolean(activeRequest.data),
  });

  return {
    request: activeRequest.data ?? null,
    estimates: estimates.data ?? [],
    isLoading: activeRequest.isPending || (Boolean(activeRequest.data) && estimates.isPending),
    error: activeRequest.error ?? estimates.error,
  };
}

/**
 * 받았던 견적 탭 — 지난 요청마다 견적 목록이 따로 필요합니다.
 *
 * 요청 수만큼 병렬 호출이라 N+1처럼 보이지만, BE에 "요청+견적"을 한 번에 주는
 * 엔드포인트가 없습니다. 요청 이력은 페이지당 소수라 실용상 문제없고,
 * 늘어나면 BE에 묶음 조회를 요청하는 게 맞습니다.
 */
export function usePastQuotes() {
  const history = useQuery({
    queryKey: myQuotesKeys.requestHistory,
    queryFn: () => quotationRequestService.getHistory(),
  });

  // 활성 요청은 "대기 중인 견적" 탭이 담당하므로 지난 요청만 남깁니다.
  // 활성 = PENDING(견적 대기) + ASSIGNED(확정, 이사 전) — 스키마 주석과 BE의
  // `quotationStatus: { in: ["PENDING", "ASSIGNED"] }` 기준입니다.
  // ASSIGNED를 빼먹으면 확정 후 이사 전인 요청이 두 탭에 동시에 나옵니다.
  const pastRequests = (history.data ?? []).filter(
    (request) => !ACTIVE_QUOTATION_STATUSES.includes(request.quotationStatus)
  );

  const estimateQueries = useQueries({
    queries: pastRequests.map((request) => ({
      queryKey: myQuotesKeys.requestEstimates(request.id),
      queryFn: () => estimateService.getByRequest(request.id, { take: ESTIMATE_LIMIT_PER_REQUEST }),
    })),
  });

  const blocks = pastRequests.map((request, index) => ({
    request,
    estimates: estimateQueries[index]?.data ?? [],
  }));

  return {
    blocks,
    isLoading: history.isPending || estimateQueries.some((query) => query.isPending),
    error: history.error ?? estimateQueries.find((query) => query.error)?.error ?? null,
  };
}
