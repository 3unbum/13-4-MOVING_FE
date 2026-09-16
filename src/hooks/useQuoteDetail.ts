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
 *
 * 실패는 호출부가 `onError`로 받아 화면에 띄웁니다 — 전역 mutation 오류 처리가
 * 없어서 여기서 안 넘기면 사용자에게 아무 안내도 가지 않습니다.
 */
export function useConfirmEstimate(
  estimateId: number,
  requestId: number | undefined,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => estimateService.confirm(estimateId),
    onError,
    // 무효화가 끝날 때까지 mutation을 pending으로 붙잡아 둡니다.
    // Promise를 반환하지 않으면 refetch 전에 isPending이 false로 떨어져,
    // 아직 PENDING인 캐시로 렌더된 확정 버튼이 잠깐 다시 눌립니다.
    // (BE가 조건부 갱신으로 이중 확정을 막지만 두 번째 요청은 에러가 됩니다)
    onSuccess: () =>
      Promise.all([
        // 확정한 견적뿐 아니라 "같은 요청의 다른 견적" 상세도 같이 비웁니다.
        // 하나를 확정하면 나머지는 PENDING으로 남지만 더 이상 확정할 수 없는데,
        // 그 캐시가 살아 있으면 형제 견적 상세에 확정 버튼이 잠깐 잘못 뜹니다.
        queryClient.invalidateQueries({ queryKey: ["estimates", "detail"] }),
        queryClient.invalidateQueries({ queryKey: myQuotesKeys.pendingEstimates }),
        queryClient.invalidateQueries({ queryKey: myQuotesKeys.activeRequest }),
        queryClient.invalidateQueries({ queryKey: myQuotesKeys.requestHistory }),
        // 받았던 견적 탭의 요청별 견적 목록 — 확정 배지가 바뀝니다
        ...(requestId === undefined
          ? []
          : [
              queryClient.invalidateQueries({
                queryKey: myQuotesKeys.requestEstimates(requestId),
              }),
              queryClient.invalidateQueries({ queryKey: quoteDetailKeys.request(requestId) }),
            ]),
      ]),
  });
}
