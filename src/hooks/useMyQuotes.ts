"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { ESTIMATE_LIMIT_PER_REQUEST, estimateService } from "@/lib/services/estimate-service";
import { quotationRequestService } from "@/lib/services/quotation-request-service";
import { useAuth } from "@/providers/AuthProvider";
import { ApiError } from "@/lib/utils/api-error";

/**
 * 프로필 미등록은 오류가 아니라 "아직 시작 안 함"입니다.
 *
 * BE가 견적 요청 조회에 `requireProfile`을 걸어 프로필이 없으면 400을 던지는데
 * (`PROFILE_REQUIRED`), 이걸 그대로 error로 두면 화면이 "불러오지 못했어요"가 됩니다.
 * 정작 필요한 건 "견적 요청하러 가기" CTA입니다 (1차 QA-3).
 */
function isProfileRequired(error: unknown) {
  return error instanceof ApiError && error.code === "PROFILE_REQUIRED";
}

/**
 * 4xx는 재시도해도 결과가 같습니다.
 *
 * QueryClient 기본값이 3회 재시도라, 프로필 없는 사용자가 CTA를 보기까지 7초 넘게
 * 빈 화면을 봅니다. 서버 오류(5xx)·네트워크 오류만 재시도합니다.
 */
function retryExceptClientError(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 3;
}

/** `PROFILE_REQUIRED`는 빈 상태로 흘려보내고, 진짜 오류만 남깁니다 */
function toRealError(error: unknown) {
  return error && !isProfileRequired(error) ? error : null;
}

export const myQuotesKeys = {
  activeRequest: ["quotation-requests", "active"] as const,
  // getActive는 쿠키 기준이라 계정별로 키를 가른다. prefix 무효화는 activeRequest 유지
  activeRequestByAuth: (userId: number | null) =>
    [...myQuotesKeys.activeRequest, userId ?? "guest"] as const,
  pendingEstimates: ["estimates", "pending"] as const,
  requestHistory: ["quotation-requests", "history"] as const,
  requestEstimates: (requestId: number) => ["estimates", "by-request", requestId] as const,
};

/**
 * 대기 중인 견적 탭 — 활성 요청(SubHeader용)과 거기 달린 견적을 함께 가져옵니다.
 *
 * 견적을 확정하면 요청이 ASSIGNED가 되는데, 그때는 이 탭이 아니라 "받았던 견적" 탭이
 * 맡습니다. `CardPendingHistory`가 "견적대기" 배지와 "견적 확정하기" 버튼을 고정으로
 * 갖고 있어(피그마 `510:43164`에 확정 변형이 없음) 확정된 견적을 표현할 수단이 없기
 * 때문입니다. 확정 배지는 `CardEstimateHistory`의 `isConfirmed`에만 있습니다.
 */
export function usePendingQuotes() {
  const { account } = useAuth();
  const activeRequest = useQuery({
    queryKey: myQuotesKeys.activeRequestByAuth(account?.userId ?? null),
    queryFn: () => quotationRequestService.getActive(),
    retry: retryExceptClientError,
  });

  // BE의 `?status=pending`은 PENDING·ASSIGNED를 모두 활성으로 보고 내려줍니다.
  // 여기서는 아직 확정 전(PENDING)인 요청만 이 탭의 대상입니다.
  const request = activeRequest.data ?? null;
  const isAwaitingConfirm = request?.quotationStatus === "PENDING";

  const estimates = useQuery({
    queryKey: myQuotesKeys.pendingEstimates,
    queryFn: () => estimateService.getPending({ take: ESTIMATE_LIMIT_PER_REQUEST }),
    // 확정 전 요청이 없으면 이 탭에 띄울 견적도 없어 호출을 아낍니다
    enabled: isAwaitingConfirm,
  });

  return {
    request: isAwaitingConfirm ? request : null,
    estimates: estimates.data ?? [],
    // 확정을 마친 활성 요청이 있는 상태. 요청이 아예 없는 것과 구분해야 합니다 —
    // 활성 요청이 있으면 새 요청을 못 하므로(`ACTIVE_REQUEST_EXISTS`)
    // "견적 요청하러 가기" CTA를 띄우면 막다른 길이 됩니다.
    hasConfirmedRequest: request !== null && !isAwaitingConfirm,
    // `isPending`은 실패한 쿼리도 true라, PROFILE_REQUIRED로 끝난 건 로딩에서 뺍니다.
    // 안 그러면 프로필 없는 사용자에게 빈 화면이 계속 돕니다 (QA-3)
    isLoading:
      (activeRequest.isPending && !isProfileRequired(activeRequest.error)) ||
      (isAwaitingConfirm && estimates.isPending),
    error: toRealError(activeRequest.error ?? estimates.error),
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
    retry: retryExceptClientError,
  });

  // "대기 중인 견적" 탭이 맡는 건 아직 확정 전(PENDING)인 요청 하나뿐입니다.
  // 확정된(ASSIGNED) 요청은 여기서 다룹니다 — 확정 배지를 가진 카드가
  // `CardEstimateHistory`뿐이고, 확정 후에도 사용자가 어떤 견적을 골랐는지
  // 볼 수 있어야 하기 때문입니다.
  //
  // ASSIGNED를 양쪽 모두에서 빼면 확정한 견적이 어느 탭에도 안 나옵니다
  // (BE `/estimates/pending`이 PENDING만 주므로 대기 탭에서도 사라집니다).
  const pastRequests = (history.data ?? []).filter(
    (request) => request.quotationStatus !== "PENDING"
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
    isLoading:
      (history.isPending && !isProfileRequired(history.error)) ||
      estimateQueries.some((query) => query.isPending),
    error: toRealError(history.error ?? estimateQueries.find((query) => query.error)?.error),
  };
}
