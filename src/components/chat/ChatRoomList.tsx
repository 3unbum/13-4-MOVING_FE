"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Loading from "@/app/[locale]/loading";
import profileDefault from "@/assets/icons/profile-lg-default.svg";
import { useChatRooms } from "@/hooks/useChat";
import type { ChatRoomItem } from "@/lib/services/chat-service";
import { formatElapsedTime, type DateLocale } from "@/lib/utils/date";
import { useAuth } from "@/providers/AuthProvider";

interface ChatRoomListProps {
  onSelect: (room: ChatRoomItem) => void;
}

function Avatar({ src }: { src: string | null }) {
  if (src) {
    return (
      <span className="relative block size-10 shrink-0 overflow-hidden rounded-full">
        <Image src={src} alt="" fill sizes="40px" className="object-cover" />
      </span>
    );
  }
  return <Image src={profileDefault} alt="" width={40} height={40} className="size-10 shrink-0" />;
}

// 카카오톡처럼 최근 대화순 방 목록. 방을 고르면 부모가 대화 화면으로 넘긴다.
export default function ChatRoomList({ onSelect }: ChatRoomListProps) {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const locale = useLocale() as DateLocale;
  const { account } = useAuth();
  const { rooms, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useChatRooms(true);

  if (isPending) {
    return <Loading className="min-h-0 flex-1" />;
  }
  if (isError) {
    return (
      <p className="text-14 p-6 text-center text-gray-500" role="alert">
        {t("loadFailed")}
      </p>
    );
  }
  if (rooms.length === 0) {
    return (
      <p className="text-14 p-6 text-center text-gray-500">
        {t(account?.role === "MOVER" ? "emptyRoomsMover" : "emptyRooms")}
      </p>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => onSelect(room)}
              className="flex w-full items-center gap-3 border-b border-gray-200 px-4 py-3 text-left hover:bg-gray-100"
            >
              <Avatar src={room.counterpart.image} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="text-16 truncate font-semibold">{room.counterpart.name}</span>
                    {/* 이사 완료 14일이 지난 방 — 대화는 볼 수 있지만 보낼 수 없다 */}
                    {room.isClosed && (
                      <span className="text-13 shrink-0 rounded bg-gray-100 px-1.5 text-gray-500">
                        {t("closedTag")}
                      </span>
                    )}
                  </span>
                  <span className="text-13 shrink-0 text-gray-500">
                    {formatElapsedTime(room.lastMessageAt, locale)}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-14 truncate text-gray-500">
                    {room.lastMessage
                      ? room.lastMessage.imageUrl
                        ? t("photo")
                        : room.lastMessage.content
                      : t("noMessages")}
                  </span>
                  {room.unreadCount > 0 && (
                    <span
                      aria-label={t("unread", { count: room.unreadCount })}
                      className="text-13 shrink-0 rounded-full bg-orange-400 px-2 font-semibold text-white"
                    >
                      {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-14 w-full py-3 text-gray-500"
        >
          {tCommon("more")}
        </button>
      )}
    </div>
  );
}
