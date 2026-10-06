"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CHAT_MESSAGES_PAGE_SIZE,
  CHAT_ROOMS_PAGE_SIZE,
  chatKeys,
  chatService,
} from "@/lib/services/chat-service";
import { notificationKeys } from "@/lib/services/notification-service";
import { ApiError } from "@/lib/utils/api-error";
import { refreshLatestChatMessages } from "@/lib/utils/chat-cache";

// 404(내 방이 아니거나 닫힌 방)·429처럼 다시 해도 같은 결과인 4xx는 재시도하지 않는다
const retryUnlessClientError = (failureCount: number, error: unknown) =>
  !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2;

/**
 * 내 방 목록(최근 대화순) 커서 무한 스크롤.
 * unreadTotal은 불러온 페이지의 합이라, 방이 한 페이지(20개)를 넘으면 실제보다 적을 수 있다
 * — BE에 읽지 않은 총합 API가 없다.
 */
export function useChatRooms(enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: chatKeys.rooms,
    queryFn: ({ pageParam }) =>
      chatService.rooms({ cursor: pageParam, take: CHAT_ROOMS_PAGE_SIZE }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    retry: retryUnlessClientError,
    enabled,
  });

  const rooms = query.data?.pages.flatMap((page) => page.items) ?? [];
  const unreadTotal = rooms.reduce((sum, room) => sum + room.unreadCount, 0);

  return { ...query, rooms, unreadTotal };
}

/**
 * 한 방의 메시지. BE가 최신순(id 내림차순)으로 주고, 다음 페이지는 더 오래된 메시지다.
 * messages[0]이 가장 최근 메시지다 — 화면에서는 column-reverse로 그려 맨 아래에 두면 된다.
 */
export function useChatMessages(roomId: number) {
  const query = useInfiniteQuery({
    queryKey: chatKeys.messages(roomId),
    queryFn: ({ pageParam }) =>
      chatService.messages(roomId, { cursor: pageParam, take: CHAT_MESSAGES_PAGE_SIZE }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    retry: retryUnlessClientError,
  });

  const messages = query.data?.pages.flatMap((page) => page.items) ?? [];
  // 읽음 위치는 매 응답에 오지만 첫 페이지(가장 최근에 받은 것)가 최신이다
  const counterpartLastReadId = query.data?.pages[0]?.counterpartLastReadId ?? null;
  // 이사 완료 14일이 지나 닫힌 방인지 — 닫혀도 지난 대화는 보이고 새 메시지만 막힌다
  const isClosed = query.data?.pages[0]?.isClosed ?? false;

  return { ...query, messages, counterpartLastReadId, isClosed };
}

export function useSendChatMessage(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => chatService.send(roomId, content),
    onSuccess: () => {
      void refreshLatestChatMessages(queryClient, roomId);
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
    },
  });
}

export function useSendChatImage(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => chatService.sendImage(roomId, file),
    onSuccess: () => {
      void refreshLatestChatMessages(queryClient, roomId);
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
    },
  });
}

/**
 * 방의 마지막 메시지까지 읽음 처리. 끝나면 목록의 읽지 않은 수를 다시 받는다.
 * BE가 이 방의 채팅 알림도 같이 읽음으로 바꾸므로 알림 목록과 숫자도 다시 받는다.
 */
export function useMarkChatRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => chatService.markRead(roomId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
