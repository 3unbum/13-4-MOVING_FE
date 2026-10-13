import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import {
  CHAT_MESSAGES_PAGE_SIZE,
  chatKeys,
  chatService,
  type ChatMessageListResult,
} from "@/lib/services/chat-service";

type MessagesData = InfiniteData<ChatMessageListResult, number | undefined>;

/**
 * 가장 최근 페이지를 새로 받은 것(fresh)을 캐시의 첫 페이지에 합칩니다. 합칠 수 없으면 null.
 *
 * 메시지는 수정·삭제되지 않아 id로 합집합을 만들면 됩니다. 이어 받기용 nextCursor는 원래 첫 페이지의 것을
 * 그대로 두고(그 뒤 페이지들이 이어져야 하므로), 상대 읽음 위치만 새 값으로 바꿉니다.
 * 한 페이지(30건)보다 많이 새로 왔다면 캐시와 fresh 사이에 빈 구간이 생겨 합칠 수 없습니다.
 */
function mergeLatestPage(cached: MessagesData, fresh: ChatMessageListResult): MessagesData | null {
  const [first, ...rest] = cached.pages;
  if (!first) return null;

  const freshOldest = fresh.items[fresh.items.length - 1]?.id;
  const cachedNewest = first.items[0]?.id;
  const hasGap =
    fresh.nextCursor !== null &&
    freshOldest !== undefined &&
    cachedNewest !== undefined &&
    freshOldest > cachedNewest;
  if (hasGap) return null;

  const byId = new Map(first.items.map((item) => [item.id, item]));
  for (const item of fresh.items) byId.set(item.id, item);
  const items = [...byId.values()].sort((a, b) => b.id - a.id);

  return {
    ...cached,
    pages: [
      {
        items,
        // 합친 페이지의 "더 오래된 쪽" 시작점은 원래 첫 페이지의 것이다. fresh는 더 새로운 쪽만 늘리므로
        // fresh.nextCursor를 쓰면 이미 가진 메시지를 다시 받는다(null이면 처음까지 다 받았다는 뜻도 유지된다)
        nextCursor: first.nextCursor,
        counterpartLastReadId: fresh.counterpartLastReadId,
        isClosed: fresh.isClosed,
      },
      ...rest,
    ],
  };
}

/**
 * 열어 둔 방의 최신 메시지만 다시 받아 캐시에 합칩니다.
 *
 * `invalidateQueries`는 무한 쿼리의 불러온 페이지를 전부 순서대로 다시 받습니다. 위로 스크롤해
 * 페이지를 많이 쌓은 채로 새 메시지가 오면 메시지 하나에 요청이 페이지 수만큼 나갑니다.
 * 이 방을 열어 본 적이 없으면(캐시 없음) 받아 둘 필요가 없어 아무것도 하지 않습니다.
 * 합칠 수 없거나 요청이 실패하면(방이 닫혀 404 등) 기존처럼 무효화해 화면이 상태를 처리하게 합니다.
 */
export async function refreshLatestChatMessages(queryClient: QueryClient, roomId: number) {
  const key = chatKeys.messages(roomId);
  if (!queryClient.getQueryData<MessagesData>(key)) return;

  try {
    const fresh = await chatService.messages(roomId, { take: CHAT_MESSAGES_PAGE_SIZE });
    // 기다리는 사이 캐시가 바뀌었을 수 있어 합치는 시점에 다시 읽는다
    const current = queryClient.getQueryData<MessagesData>(key);
    if (!current) return;

    const merged = mergeLatestPage(current, fresh);
    if (merged) {
      queryClient.setQueryData(key, merged);
      return;
    }
  } catch {
    // 아래에서 무효화한다
  }
  await queryClient.invalidateQueries({ queryKey: key });
}
