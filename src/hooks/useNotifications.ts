"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/utils/api-error";
import {
  notificationKeys,
  notificationService,
  type NotificationSummaryItem,
} from "@/lib/services/notification-service";

/** 한 번에 받아 오는 개수. 화면에는 3장까지 펼치고, 4장부터는 스크롤로 다음 페이지를 붙입니다. */
const NOTIFICATION_PAGE_SIZE = 10;

/** BE가 끊긴 연결에 적어 두는 재시도 간격과 맞춥니다. */
const STREAM_RETRY_MS = 5_000;
const STREAM_MAX_FAILURES = 5;

function rank(order: string[], value: string) {
  const index = order.indexOf(value);
  return index === -1 ? order.length : index;
}

/**
 * 기사님이 프로필에 고른 지역·유형 순으로 묶습니다.
 * 요약 API는 건수만 주고 정렬은 하지 않습니다.
 */
export function sortRequestSummary(
  items: NotificationSummaryItem[],
  regionOrder: string[],
  serviceOrder: string[]
) {
  return [...items].sort(
    (a, b) =>
      rank(regionOrder, a.region) - rank(regionOrder, b.region) ||
      rank(serviceOrder, a.category) - rank(serviceOrder, b.category)
  );
}

/** 같은 지역은 한 줄에 이사 유형을 이어 붙이려고 묶습니다. */
export function groupRequestSummary(
  items: NotificationSummaryItem[],
  regionOrder: string[],
  serviceOrder: string[]
) {
  const groups: {
    region: NotificationSummaryItem["region"];
    categories: { category: NotificationSummaryItem["category"]; count: number }[];
  }[] = [];

  for (const item of sortRequestSummary(items, regionOrder, serviceOrder)) {
    const current = groups.at(-1);
    if (current?.region === item.region) {
      current.categories.push({ category: item.category, count: item.count });
      continue;
    }
    groups.push({
      region: item.region,
      categories: [{ category: item.category, count: item.count }],
    });
  }

  return groups;
}

/**
 * 로그인 중에만 스트림을 붙입니다.
 *
 * EventSource는 cookieFetch를 타지 않아서, 401이 나도 토큰을 스스로 갱신하지 못합니다.
 * 오류가 나면 목록 조회로 refresh를 태운 뒤 다시 붙입니다.
 */
function useNotificationStream(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    let source: EventSource | null = null;
    let stopped = false;
    let failures = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (stopped) return;

      // close()가 직전 연결의 onerror를 다시 부르면 재연결이 겹칩니다.
      const previous = source;
      source = null;
      if (previous) {
        previous.onerror = null;
        previous.close();
      }

      const next = new EventSource("/api/notifications/stream", { withCredentials: true });
      source = next;

      next.onopen = () => {
        // 끊겼다 붙은 뒤에는 놓친 알림이 있을 수 있어 목록을 다시 받습니다.
        if (failures > 0) {
          void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }
        failures = 0;
      };

      // 이벤트 본문은 { type }뿐이라 목록을 다시 받아야 문장이 생깁니다.
      next.addEventListener("notification", () => {
        failures = 0;
        void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      });

      next.onerror = () => {
        if (source !== next || stopped) return;
        next.close();
        source = null;
        failures += 1;
        if (failures > STREAM_MAX_FAILURES) return;
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => {
          void reconnect();
        }, STREAM_RETRY_MS);
      };
    };

    const reconnect = async () => {
      if (stopped) return;
      try {
        await notificationService.list({ take: 1 });
        connect();
      } catch (error) {
        // refresh까지 실패한 401만 세션 없음으로 봅니다. 네트워크·5xx는 한도 안에서 다시 붙입니다.
        if (error instanceof ApiError && error.status === 401) {
          stopped = true;
          return;
        }
        failures += 1;
        if (failures > STREAM_MAX_FAILURES) return;
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => {
          void reconnect();
        }, STREAM_RETRY_MS);
      }
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      if (source) {
        source.onerror = null;
        source.close();
      }
    };
  }, [enabled, queryClient]);
}

export function useNotifications(enabled: boolean, summaryEnabled: boolean) {
  const queryClient = useQueryClient();

  const list = useInfiniteQuery({
    queryKey: notificationKeys.list,
    queryFn: ({ pageParam }) =>
      notificationService.list({
        take: NOTIFICATION_PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });

  const summary = useQuery({
    queryKey: notificationKeys.summary,
    queryFn: () => notificationService.summary(),
    enabled: enabled && summaryEnabled,
  });

  useNotificationStream(enabled);

  useEffect(() => {
    if (enabled) return;
    queryClient.removeQueries({ queryKey: notificationKeys.all });
  }, [enabled, queryClient]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => notificationService.remove(id),
    onSuccess: invalidate,
  });

  const removeAll = useMutation({
    mutationFn: async () => {
      // 목록은 페이지라 첫 페이지를 반복해서 지웁니다. 커서는 다음 요청에 넘기지 않습니다.
      // 종료는 빈 목록이거나, BE가 한 건도 안 지운 때입니다.
      for (;;) {
        const result = await notificationService.list({ take: 20 });
        const ids = result.items.map((item) => item.id);
        if (ids.length === 0) return;
        const deleted = await notificationService.removeMany(ids);
        if (deleted.deletedCount === 0) return;
      }
    },
    onSuccess: invalidate,
  });

  return {
    items: list.data?.pages.flatMap((page) => page.items) ?? [],
    unreadCount: list.data?.pages[0]?.unreadCount ?? 0,
    hasMore: list.hasNextPage,
    isLoadingMore: list.isFetchingNextPage,
    loadMore: () => {
      void list.fetchNextPage();
    },
    summaryItems: summary.data?.items ?? [],
    markRead,
    markAllRead,
    remove,
    removeAll,
  };
}
