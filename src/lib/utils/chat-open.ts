/**
 * 채팅 창을 특정 방으로 여는 신호. 알림처럼 ChatWidget 바깥에서 "이 방 열어줘"를 보낼 때 씁니다.
 * 창 상태가 ChatWidget 안에 있어 전역 스토어 대신 window 이벤트로 잇습니다.
 */
export const CHAT_OPEN_EVENT = "chat:open";

export interface ChatOpenDetail {
  roomId: number;
  /** 대화 화면 헤더에 쓸 상대 이름 — 알림 payload의 senderName */
  name: string;
}

export function openChatRoom(detail: ChatOpenDetail) {
  window.dispatchEvent(new CustomEvent<ChatOpenDetail>(CHAT_OPEN_EVENT, { detail }));
}
