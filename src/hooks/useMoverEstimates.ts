"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MOVER_ESTIMATE_PAGE_SIZE,
  moverEstimateService,
  type MoverEstimate,
  type MoverEstimateSort,
  type MoverEstimateStatus,
} from "@/lib/services/mover-estimate-service";
import type { PaymentStageFilter } from "@/lib/services/estimate-service";

export const moverEstimateKeys = {
  list: (status: MoverEstimateStatus) => ["mover-estimates", "list", status] as const,
  // `["mover-estimates"]` prefix라 한 번에 무효화됩니다
  pay: (stage: PaymentStageFilter, sort: MoverEstimateSort, month?: string) =>
    ["mover-estimates", "pay", stage, sort, month ?? "all"] as const,
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

/**
 * 결제 탭 — 고객의 결제 단계로 가릅니다.
 *
 *   대기 중인 결제  stage = DUE  (고객이 선수금 또는 잔금을 아직 안 냄)
 *   결제 내역       stage = PAID (잔금까지 결제 완료)
 *
 * `sort`로 최신순/오래된 순을, `month`("YYYY-MM")로 이사 완료 월을 고릅니다 — 조합마다 따로 캐시됩니다.
 * 기사님은 결제를 직접 처리하지 않고 결과만 봅니다. 목록은 커서 무한 스크롤이라
 * 받은 개수가 한 페이지보다 적으면 끝으로 봅니다 (`useEstimatePages`와 같은 방식).
 */
export function usePayMoverEstimates(
  stage: PaymentStageFilter,
  sort: MoverEstimateSort = "latest",
  month?: string
) {
  const query = useInfiniteQuery({
    queryKey: moverEstimateKeys.pay(stage, sort, month),
    queryFn: ({ pageParam }) =>
      moverEstimateService.getList({
        paymentStage: stage,
        sort,
        month,
        cursor: pageParam,
        take: MOVER_ESTIMATE_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length < MOVER_ESTIMATE_PAGE_SIZE ? undefined : lastPage.at(-1)?.id,
  });

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

/**
 * 결제 요청 보내기 — 고객에게 알림이 갑니다. 견적당 1번만 보낼 수 있습니다.
 *
 * 성공하면 목록을 다시 받아 `paymentRequestedAt`이 채워지고 버튼이 "요청 완료"로 바뀝니다.
 * 이미 보낸 견적(409)도 서버 기준으로 상태를 맞추려고 같은 갱신을 합니다.
 * 실패는 호출부가 `onError`로 받아 화면에 띄웁니다 — 전역 mutation 오류 처리가 없습니다.
 */
export function useRequestPayment(onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estimateId: number) => moverEstimateService.requestPayment(estimateId),
    onError: (error) => {
      onError?.(error);
      return queryClient.invalidateQueries({ queryKey: ["mover-estimates"] });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mover-estimates"] }),
  });
}

/**
 * 추가 금액 요청 — 이사 완료 후 사유와 금액을 고객에게 보냅니다. 견적당 여러 건 보낼 수 있습니다.
 *
 * 성공하면 목록을 다시 받아 `extraCharges`에 새 건이 붙습니다.
 * 실패(상한 초과 등)해도 서버 기준으로 상태를 맞추려고 같은 갱신을 합니다.
 * 실패는 호출부가 `onError`로 받아 화면에 띄웁니다 — 전역 mutation 오류 처리가 없습니다.
 */
export function useProposeExtraCharge(onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      estimateId,
      amount,
      reason,
    }: {
      estimateId: number;
      amount: number;
      reason: string;
    }) => moverEstimateService.proposeExtraCharge(estimateId, { amount, reason }),
    onError: (error) => {
      onError?.(error);
      return queryClient.invalidateQueries({ queryKey: ["mover-estimates"] });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mover-estimates"] }),
  });
}

/**
 * 추가 금액 수정 — 고객이 아직 응답하지 않은 건의 금액·사유를 고칩니다.
 * 이미 응답한 건이면 서버가 400으로 거절하므로, 실패해도 목록을 다시 받아 상태를 맞춥니다.
 */
export function useUpdateExtraCharge(onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      estimateId,
      chargeId,
      amount,
      reason,
    }: {
      estimateId: number;
      chargeId: number;
      amount: number;
      reason: string;
    }) => moverEstimateService.updateExtraCharge(estimateId, chargeId, { amount, reason }),
    onError: (error) => {
      onError?.(error);
      return queryClient.invalidateQueries({ queryKey: ["mover-estimates"] });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mover-estimates"] }),
  });
}

/** 견적 상세 (#34) */
export function useMoverEstimate(estimateId: number) {
  return useQuery({
    queryKey: moverEstimateKeys.detail(estimateId),
    queryFn: () => moverEstimateService.getById(estimateId),
    enabled: Number.isFinite(estimateId),
  });
}
