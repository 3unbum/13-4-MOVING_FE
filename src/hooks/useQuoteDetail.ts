"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { estimateService } from "@/lib/services/estimate-service";
import { quotationRequestService } from "@/lib/services/quotation-request-service";
import { myQuotesKeys } from "@/hooks/useMyQuotes";

export const quoteDetailKeys = {
  estimate: (estimateId: number) => ["estimates", "detail", estimateId] as const,
  request: (requestId: number) => ["quotation-requests", "detail", requestId] as const,
};

/**
 * 견적 상세 — 견적 1건 + 그 견적이 달린 요청.
 *
 * 요청을 따로 받는 이유는 "견적 정보" 블록의 출발지·도착지 때문입니다.
 * `GET /estimates/:id`가 주는 `quotationRequest`에는 주소가 없습니다.
 */
export function useQuoteDetail(estimateId: number) {
  const estimate = useQuery({
    queryKey: quoteDetailKeys.estimate(estimateId),
    queryFn: () => estimateService.getById(estimateId),
    enabled: Number.isFinite(estimateId),
  });

  const requestId = estimate.data?.quotationRequestId;

  const request = useQuery({
    queryKey: quoteDetailKeys.request(requestId ?? 0),
    queryFn: () => quotationRequestService.getById(requestId as number),
    enabled: requestId !== undefined,
  });

  return {
    estimate: estimate.data,
    request: request.data,
    isLoading: estimate.isPending || (requestId !== undefined && request.isPending),
    error: estimate.error ?? request.error,
  };
}

/**
 * 견적 확정 (#29).
 *
 * BE는 선택한 견적만 CONFIRMED로 바꾸고 나머지는 PENDING으로 둡니다(9/16 실측).
 * 확정 후 요청 상태가 ASSIGNED로 바뀌므로 목록 캐시도 함께 무효화합니다.
 */
export function useConfirmEstimate(estimateId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => estimateService.confirm(estimateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteDetailKeys.estimate(estimateId) });
      queryClient.invalidateQueries({ queryKey: myQuotesKeys.pendingEstimates });
      queryClient.invalidateQueries({ queryKey: myQuotesKeys.activeRequest });
      queryClient.invalidateQueries({ queryKey: myQuotesKeys.requestHistory });
    },
  });
}
