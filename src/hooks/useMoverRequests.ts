"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MOVER_REQUEST_PAGE_SIZE,
  moverRequestService,
  type MoverRequestListQuery,
  type RejectRequestPayload,
  type SendEstimatePayload,
} from "@/lib/services/mover-request-service";

export const moverRequestKeys = {
  list: (filters: MoverRequestListQuery) => ["mover-requests", "list", filters] as const,
};

/**
 * 받은 요청 목록 — 커서 무한 스크롤.
 *
 * 필터·정렬이 바뀌면 queryKey가 바뀌어 1페이지부터 다시 받습니다.
 *
 * BE가 배열만 내려주고 `nextCursor`·`hasNext`를 주지 않아서, 마지막 항목의 `id`를
 * 커서로 쓰고 "받은 개수가 페이지 크기보다 적으면 끝"으로 판단합니다.
 * (기사님 목록 `useMoversInfinite`는 BE가 커서를 함께 주지만 이쪽 API는 다릅니다)
 */
export function useMoverRequests(filters: MoverRequestListQuery = {}) {
  const listQuery = { ...filters, take: filters.take ?? MOVER_REQUEST_PAGE_SIZE };

  const query = useInfiniteQuery({
    queryKey: moverRequestKeys.list(listQuery),
    queryFn: ({ pageParam }) => moverRequestService.getList({ ...listQuery, cursor: pageParam }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      // 요청한 만큼 다 안 왔으면 마지막 페이지입니다
      if (lastPage.length < listQuery.take) return undefined;
      return lastPage.at(-1)?.id;
    },
  });

  return {
    ...query,
    /** 페이지를 펼친 전체 목록 — 화면은 이것만 쓰면 됩니다 */
    requests: query.data?.pages.flat() ?? [],
  };
}

/**
 * 견적 보내기 / 요청 반려.
 *
 * 둘 다 처리하면 그 요청이 목록에서 빠집니다(BE가 `estimates: { none: { moverId } }`로
 * 아직 응답하지 않은 요청만 내려줍니다). 그래서 성공 시 목록 캐시를 비웁니다.
 *
 * 실패는 호출부가 `onError`로 받아 화면에 띄웁니다 — 전역 mutation 오류 처리가 없어
 * 여기서 안 넘기면 사용자에게 아무 안내도 가지 않습니다.
 */
export function useMoverRequestAction(onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["mover-requests", "list"] });

  const sendEstimate = useMutation({
    mutationFn: ({ requestId, ...payload }: { requestId: number } & SendEstimatePayload) =>
      moverRequestService.sendEstimate(requestId, payload),
    onError,
    onSuccess: invalidateList,
  });

  const reject = useMutation({
    mutationFn: ({ requestId, ...payload }: { requestId: number } & RejectRequestPayload) =>
      moverRequestService.reject(requestId, payload),
    onError,
    onSuccess: invalidateList,
  });

  return { sendEstimate, reject };
}
