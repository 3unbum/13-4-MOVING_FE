"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isProfileRequired, retryExceptClientError, toRealError } from "@/hooks/useMyQuotes";
import {
  estimateService,
  type ExtraChargeDecision,
  type PayEstimateInput,
  type PaymentStageFilter,
  type PaySort,
} from "@/lib/services/estimate-service";

/** 한 번에 받는 개수 — BE `take` 상한(20) 안이고, 첫 화면을 채우고도 스크롤이 생기는 크기입니다 */
const PAY_PAGE_SIZE = 10;

export const payQuotesKeys = {
  // `["estimates"]` prefix라 견적 확정·결제 시 prefix 무효화로 함께 비워집니다
  list: (stage: PaymentStageFilter, sort: PaySort, month?: string) =>
    ["estimates", "mine", stage, sort, month ?? "all"] as const,
};

/**
 * 결제 탭 목록 — 결제 단계로 가르고, 무한 스크롤로 이어 받습니다.
 *
 *   대기 중인 결제  stage = DUE  (확정 후 선수금 대기 + 이사 완료 후 잔금 대기)
 *   결제 내역       stage = PAID (잔금까지 결제 완료)
 *
 * `sort`(최신순/오래된 순)와 `month`("YYYY-MM")는 카드에 보이는 날짜 기준입니다 — 조합마다 따로 캐시됩니다.
 * BE는 커서(마지막 견적 id)로 이어 받습니다. 응답에 "더 있음" 표시가 없어서,
 * 받은 개수가 한 페이지(`PAY_PAGE_SIZE`)보다 적으면 끝으로 봅니다.
 *
 * 프로필이 없으면 BE가 `PROFILE_REQUIRED`로 거절하는데, 오류가 아니라 "아직 견적이 없음"입니다.
 * 다른 탭과 같은 기준으로 빈 목록으로 흘려보냅니다.
 */
export function usePayQuotes(stage: PaymentStageFilter, sort: PaySort = "latest", month?: string) {
  const query = useInfiniteQuery({
    queryKey: payQuotesKeys.list(stage, sort, month),
    queryFn: ({ pageParam }) =>
      estimateService.getMine({
        paymentStage: stage,
        sort,
        month,
        take: PAY_PAGE_SIZE,
        cursor: pageParam,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length < PAY_PAGE_SIZE ? undefined : lastPage[lastPage.length - 1]?.id,
    retry: retryExceptClientError,
  });

  return {
    estimates: query.data?.pages.flat() ?? [],
    isLoading: query.isPending && !isProfileRequired(query.error),
    error: toRealError(query.error),
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}

/**
 * 결제 승인 — 토스 결제창이 돌려준 값을 BE로 보내 승인받습니다.
 *
 * 성공하면 견적 캐시 전체를 비웁니다. 대기 중인 결제 목록에서 빠지고 결제 내역에 들어가며,
 * 상세 화면의 결제 상태도 바뀌기 때문입니다. refetch가 끝날 때까지 pending으로 붙잡아 둡니다.
 */
export function usePayEstimate(estimateId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PayEstimateInput) => estimateService.pay(estimateId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estimates"] }),
  });
}

/**
 * 추가 금액 승인·거절 — 기사님이 요청한 추가 금액 중 고른 건에 한 번에 응답합니다.
 *
 * 응답하면 잔금이 바뀌고(승인) 결제 버튼이 열리므로 견적 캐시 전체를 비웁니다.
 * 실패는 호출부가 `onError`로 받아 화면에 띄웁니다 — 전역 mutation 오류 처리가 없습니다.
 */
export function useRespondExtraCharge(onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      estimateId,
      decision,
      chargeIds,
    }: {
      estimateId: number;
      decision: ExtraChargeDecision;
      chargeIds: number[];
    }) => estimateService.respondExtraCharge(estimateId, decision, chargeIds),
    onError: (error) => {
      onError?.(error);
      return queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estimates"] }),
  });
}
