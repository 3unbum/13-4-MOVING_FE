"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Loading from "@/app/[locale]/loading";
import plusIcon from "@/assets/icons/plus-md.svg";
import sendIcon from "@/assets/icons/send-md.svg";
import {
  useChatMessages,
  useMarkChatRead,
  useSendChatImage,
  useSendChatMessage,
} from "@/hooks/useChat";
import { useCountdown } from "@/hooks/useCountdown";
import { findAuthErrorMessageKey } from "@/lib/auth/auth-error-message";
import { findRetryAfterSeconds } from "@/lib/auth/rate-limit";
import {
  CHAT_IMAGE_ALLOWED_TYPES,
  CHAT_IMAGE_MAX_SIZE_BYTES,
  CHAT_IMAGE_MAX_SIZE_MB,
  CHAT_MESSAGE_MAX_LENGTH,
  chatKeys,
} from "@/lib/services/chat-service";
import { ApiError } from "@/lib/utils/api-error";
import { cn } from "@/lib/utils/cn";
import type { DateLocale } from "@/lib/utils/date";
import { useAuth } from "@/providers/AuthProvider";

interface ChatRoomViewProps {
  roomId: number;
  /** 방이 닫혔거나 내 방이 아니게 된 경우(404) — 부모가 목록으로 돌려보낸다 */
  onUnavailable: () => void;
}

// 대화 화면. 부모가 key={roomId}로 방마다 새로 마운트해 읽음 기록이 방끼리 섞이지 않는다.
export default function ChatRoomView({ roomId, onUnavailable }: ChatRoomViewProps) {
  const t = useTranslations("chat");
  const tAuthError = useTranslations("authError");
  const locale = useLocale() as DateLocale;
  const queryClient = useQueryClient();
  const { account } = useAuth();
  const myId = account?.userId;

  const {
    messages,
    counterpartLastReadId,
    isClosed,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useChatMessages(roomId);
  const send = useSendChatMessage(roomId);
  const sendImage = useSendChatImage(roomId);
  const { mutate: markRead } = useMarkChatRead();
  const { remainingSeconds, start } = useCountdown();
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const markedUpToRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error instanceof ApiError && error.status === 404) {
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
      onUnavailable();
    }
  }, [error, onUnavailable, queryClient]);

  // 상대가 보낸 최신 메시지는 화면을 보고 있을 때만 읽음 처리한다 — 가려진 탭에서 읽은 것으로 되면 안 된다.
  // 내가 보낸 메시지가 최신이면 BE가 전송 때 이미 읽음으로 처리해 둔다.
  const newest = messages[0];
  const newestId = newest?.id;
  const newestIsMine = newest?.senderId === myId;
  useEffect(() => {
    if (newestId === undefined || newestIsMine) return;
    const markIfVisible = () => {
      if (document.visibilityState !== "visible" || markedUpToRef.current >= newestId) return;
      markedUpToRef.current = newestId;
      markRead(roomId);
    };
    markIfVisible();
    document.addEventListener("visibilitychange", markIfVisible);
    return () => document.removeEventListener("visibilitychange", markIfVisible);
  }, [newestId, newestIsMine, roomId, markRead]);

  // 글·사진은 같은 분당 30건 한도를 쓰므로 잠금과 전송 중 상태를 함께 본다
  const isSending = send.isPending || sendImage.isPending;
  const isLocked = isSending || remainingSeconds > 0;
  const trimmed = draft.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= CHAT_MESSAGE_MAX_LENGTH && !isLocked;

  const handleSendError = (sendFailure: unknown) => {
    // 분당 30건을 넘으면 429 — 풀릴 때까지 보내기 버튼을 잠근다
    // 열어 둔 사이에 14일이 지나 방이 닫힌 경우 — 입력창이 닫힘 안내로 바뀌도록 방 상태를 다시 받는다
    if (sendFailure instanceof ApiError && sendFailure.code === "CHAT_ROOM_CLOSED") {
      setSendError(t("closed"));
      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(roomId) });
      return;
    }
    const retryAfterSeconds = findRetryAfterSeconds(sendFailure);
    if (retryAfterSeconds) start(retryAfterSeconds);
    // BE 문구는 한국어 고정이라 번역 키가 있는 코드만 쓰고, 없으면 화면 기본 문구로 둔다
    const messageKey = findAuthErrorMessageKey(sendFailure);
    setSendError(messageKey ? tAuthError(messageKey) : t("sendFailed"));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    setSendError(null);
    send.mutate(trimmed, {
      onSuccess: () => setDraft(""),
      onError: handleSendError,
    });
  };

  const handleImagePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 골라도 change가 오도록 비워 둔다
    event.target.value = "";
    if (!file || isLocked) return;

    // BE도 거르지만 올리기 전에 알려야 큰 파일을 헛되이 보내지 않는다
    if (!CHAT_IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setSendError(t("imageTypeInvalid"));
      return;
    }
    if (file.size > CHAT_IMAGE_MAX_SIZE_BYTES) {
      setSendError(t("imageTooLarge", { size: CHAT_IMAGE_MAX_SIZE_MB }));
      return;
    }
    setSendError(null);
    sendImage.mutate(file, { onError: handleSendError });
  };

  // 내가 보낸 가장 최근 메시지 하나에만 "읽음"을 붙인다
  const lastMineId = messages.find((message) => message.senderId === myId)?.id;
  const isLastMineRead =
    lastMineId !== undefined &&
    counterpartLastReadId !== null &&
    lastMineId <= counterpartLastReadId;

  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
  // "2026년 10월 2일 금요일" — 구분선과 메시지 시각 옆에 쓰는 날짜
  const dateFormat = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  // 날짜가 바뀌는 지점을 찾는 키 — 보는 사람의 시간대 기준 하루
  const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA");

  let body;
  if (isPending) {
    body = <Loading className="min-h-0 flex-1" />;
  } else if (isError) {
    body = (
      <p className="text-14 p-6 text-center text-gray-500" role="alert">
        {t("loadFailed")}
      </p>
    );
  } else if (messages.length === 0) {
    body = <p className="text-14 p-6 text-center text-gray-500">{t("emptyMessages")}</p>;
  } else {
    // API가 최신순이라 column-reverse로 그리면 최신이 맨 아래에 놓이고 스크롤도 아래에서 시작한다.
    // DOM 마지막 항목이 화면 맨 위가 되므로 "이전 메시지" 버튼을 마지막에 둔다.
    body = (
      <ul className="flex min-h-0 flex-1 flex-col-reverse gap-2 overflow-y-auto px-4 py-3">
        {messages.map((message, index) => {
          const mine = message.senderId === myId;
          // 카카오톡처럼 하루가 시작되는 첫 메시지 위에 날짜 구분선을 긋는다. 최신순이라 바로 다음(index+1)이
          // 더 오래된 메시지이고, column-reverse라 DOM에서 뒤에 오는 줄이 화면에서는 위에 놓인다.
          // 더 오래된 페이지가 남았다면 이 날의 시작이 아직 안 보일 수 있어 맨 끝에서는 긋지 않는다.
          const older = messages[index + 1];
          const startsDay = older
            ? dayKey(older.createdAt) !== dayKey(message.createdAt)
            : !hasNextPage;
          return (
            <Fragment key={message.id}>
              <li className={cn("flex items-end gap-1.5", mine && "flex-row-reverse")}>
                {message.imageUrl ? (
                  <a
                    href={message.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("photo")}
                    className="block max-w-[75%] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={message.imageUrl}
                      alt={t("photo")}
                      width={240}
                      height={240}
                      sizes="240px"
                      className="h-auto max-h-60 w-60 max-w-full object-cover"
                    />
                  </a>
                ) : (
                  <p
                    className={cn(
                      "text-14 max-w-[75%] rounded-2xl px-3 py-2 break-words whitespace-pre-wrap",
                      mine ? "bg-orange-400 text-white" : "bg-gray-100"
                    )}
                  >
                    {message.content}
                  </p>
                )}
                <span className="text-13 flex shrink-0 flex-col items-end text-gray-500">
                  {mine && message.id === lastMineId && isLastMineRead && <span>{t("read")}</span>}
                  <span>{timeFormat.format(new Date(message.createdAt))}</span>
                </span>
              </li>
              {startsDay && (
                <li className="text-13 flex items-center gap-3 py-2 text-gray-500">
                  <span aria-hidden className="h-px flex-1 bg-gray-200" />
                  <span>{dateFormat.format(new Date(message.createdAt))}</span>
                  <span aria-hidden className="h-px flex-1 bg-gray-200" />
                </li>
              )}
            </Fragment>
          );
        })}
        {hasNextPage && (
          <li className="text-center">
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-13 text-gray-500 underline"
            >
              {t("olderMessages")}
            </button>
          </li>
        )}
      </ul>
    );
  }

  const announcement =
    newest && !newestIsMine ? (newest.imageUrl ? t("photo") : newest.content) : "";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 대화 맨 위 안내. 메시지가 쌓여도 스크롤되지 않고 항상 위에 남는다 */}
      <p className="text-13 shrink-0 bg-gray-100 px-4 py-2.5 whitespace-pre-line text-gray-500">
        {t("notice")}
      </p>
      {/* 스크린 리더용 — 상대의 새 메시지가 오면 읽어 준다. 내용이 바뀔 때만 알리므로 처음 열 때는 조용하다 */}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {body}
      {isClosed ? (
        // 이사 완료 14일이 지난 방 — 지난 대화는 위에서 계속 볼 수 있고, 입력창만 안내로 바꾼다
        <p className="text-14 shrink-0 border-t border-gray-200 bg-gray-100 p-4 text-center text-gray-500">
          {t("closed")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
          {sendError && (
            <p className="text-13 pb-2 text-red-500" role="alert">
              {sendError}
            </p>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={CHAT_IMAGE_ALLOWED_TYPES.join(",")}
              onChange={handleImagePick}
              className="hidden"
              tabIndex={-1}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLocked}
              aria-label={t("addImage")}
              className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 disabled:opacity-40"
            >
              <Image src={plusIcon} alt="" width={24} height={24} />
            </button>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={CHAT_MESSAGE_MAX_LENGTH}
              placeholder={t("inputPlaceholder")}
              aria-label={t("inputPlaceholder")}
              className="text-14 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label={t("send")}
              className="flex w-11 shrink-0 items-center justify-center rounded-xl bg-orange-400 disabled:opacity-40"
            >
              <Image src={sendIcon} alt="" width={24} height={24} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
