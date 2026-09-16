"use client";

import { useEffect, useRef } from "react";

/**
 * 목록 하단 sentinel이 보이면 onLoadMore 호출.
 * - enabled: hasNextPage일 때만 observe
 * - isLoading: 다음 페이지 fetch 중이면 중복 요청 방지
 * - rootMargin: 바닥 도달 전 미리 로드
 */
export function useInfiniteScrollTrigger(
  onLoadMore: () => void,
  { enabled, isLoading }: { enabled: boolean; isLoading: boolean }
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // 렌더마다 새 함수여도 observer는 재구독하지 않고, 콜백만 최신으로 유지
  const onLoadMoreRef = useRef(onLoadMore);

  // 렌더 중 ref 갱신은 금지 — 매 커밋 후 최신 콜백만 동기화
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: "160px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, isLoading]);

  return sentinelRef;
}
