import { cookieFetch } from "@/lib/utils/api-client";

export interface ChatCounterpart {
  id: number;
  name: string;
  /** 고객 프로필 사진이 없는 경우처럼 null일 수 있습니다 */
  image: string | null;
}

export interface ChatLastMessage {
  id: number;
  /** 사진만 보낸 메시지는 빈 문자열 */
  content: string;
  /** 사진 메시지일 때만 */
  imageUrl: string | null;
  senderId: number;
  createdAt: string;
}

export interface ChatRoomItem {
  id: number;
  estimateId: number;
  /** 고객이 보면 기사님(닉네임, 없으면 이름), 기사님이 보면 고객(이름) */
  counterpart: ChatCounterpart;
  /** 메시지가 없는 방이면 null — 이때 lastMessageAt은 방 생성 시각 */
  lastMessage: ChatLastMessage | null;
  lastMessageAt: string;
  unreadCount: number;
  /** 이사 완료 14일이 지나 새 메시지를 보낼 수 없는 방 — 대화 열람·읽음 처리는 된다 */
  isClosed: boolean;
}

export interface ChatRoomListResult {
  items: ChatRoomItem[];
  nextCursor: number | null;
}

export interface ChatMessageItem {
  id: number;
  roomId: number;
  senderId: number;
  /** 사진만 보낸 메시지는 빈 문자열 */
  content: string;
  /** 사진 메시지일 때만. 한 메시지에 한 장 */
  imageUrl: string | null;
  createdAt: string;
}

export interface ChatMessageListResult {
  /** 최신순(id 내림차순) — 그릴 때 뒤집습니다 */
  items: ChatMessageItem[];
  nextCursor: number | null;
  /** 내가 보낸 메시지 중 id <= 이 값이면 "읽음". null이면 전부 안 읽음 */
  counterpartLastReadId: number | null;
  /** true면 입력창을 막는다. 보내면 403 CHAT_ROOM_CLOSED */
  isClosed: boolean;
}

export interface ChatListQuery {
  cursor?: number;
  take?: number;
}

/** SSE `chat` 이벤트 — 신호만 담고 본문은 API로 다시 받습니다 */
export type ChatStreamEvent =
  { type: "MESSAGE"; roomId: number; messageId: number } | { type: "READ"; roomId: number };

/** BE 방 목록 take 상한 20, 메시지 상한 50 */
export const CHAT_ROOMS_PAGE_SIZE = 20;
export const CHAT_MESSAGES_PAGE_SIZE = 30;
export const CHAT_MESSAGE_MAX_LENGTH = 1000;

/** BE chat.upload.ts(= 프로필 이미지 한도)와 동일 — 올리기 전에 FE에서도 거른다 */
export const CHAT_IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const CHAT_IMAGE_MAX_SIZE_MB = 5;
export const CHAT_IMAGE_MAX_SIZE_BYTES = CHAT_IMAGE_MAX_SIZE_MB * 1024 * 1024;

export const chatKeys = {
  all: ["chat"] as const,
  rooms: ["chat", "rooms"] as const,
  messages: (roomId: number) => ["chat", "messages", roomId] as const,
};

function toQuery(query: ChatListQuery = {}) {
  const params = new URLSearchParams();
  if (query.cursor) params.set("cursor", String(query.cursor));
  if (query.take) params.set("take", String(query.take));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const chatService = {
  /** 최근 대화순. 이사 완료 14일이 지난 방도 목록에 남지만 isClosed입니다(지난 대화는 보고, 새 메시지는 못 보냄). */
  rooms: (query?: ChatListQuery) => cookieFetch<ChatRoomListResult>(`/chat-rooms${toQuery(query)}`),

  /** 내 방이 아니거나 닫힌 방은 404입니다. */
  messages: (roomId: number, query?: ChatListQuery) =>
    cookieFetch<ChatMessageListResult>(`/chat-rooms/${roomId}/messages${toQuery(query)}`),

  /** 앞뒤 공백을 뗀 1~1000자. 유저당 분당 30건을 넘으면 429(retryAfterSeconds). */
  send: (roomId: number, content: string) =>
    cookieFetch<ChatMessageItem>(`/chat-rooms/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  /**
   * 사진 한 장을 올려 사진 메시지로 보냅니다. multipart `image` 필드 하나만 받고
   * (api-client가 FormData면 Content-Type을 건드리지 않는다), 전송 한도는 글 메시지와 공유합니다.
   */
  sendImage: (roomId: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return cookieFetch<ChatMessageItem>(`/chat-rooms/${roomId}/images`, {
      method: "POST",
      body: formData,
    });
  },

  /** 방의 마지막 메시지까지 읽음 처리합니다. 메시지가 없으면 null. */
  markRead: (roomId: number) =>
    cookieFetch<{ lastReadId: number | null }>(`/chat-rooms/${roomId}/read`, { method: "PATCH" }),
};
