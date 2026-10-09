import type { RegionCode, ServiceCode } from "@/components/filter/ChipRegion";
import { cookieFetch } from "@/lib/utils/api-client";

/**
 * 알림 종류. 문장은 BE에 없고, FE가 type + payload + 역할로 만듭니다.
 * 전날·당일은 payload가 같고 type만 다릅니다.
 */
export type NotificationType =
  | "NEW_REQUEST"
  | "NEW_ESTIMATE"
  | "ESTIMATE_CONFIRMED"
  | "MOVING_DAY_BEFORE"
  | "MOVING_DAY"
  | "NEW_CHAT_MESSAGE"
  | "PAYMENT_REQUEST"
  | "PAYMENT_COMPLETED"
  | "DEPOSIT_PAID"
  | "DEPOSIT_EXPIRED"
  | "EXTRA_CHARGE_PROPOSED"
  | "EXTRA_CHARGE_RESPONDED";

interface NotificationBase {
  id: number;
  isRead: boolean;
  createdAt: string;
  estimateId: number | null;
  quotationRequestId: number | null;
  /** 채팅 알림일 때만. 컴포넌트 쇼케이스의 예시 데이터는 생략합니다 */
  chatRoomId?: number | null;
}

export interface NewRequestPayload {
  customerName: string;
  category: ServiceCode;
  fromRegion: RegionCode;
  movingDate: string;
}

export interface NewEstimatePayload {
  moverNickName: string;
  category: ServiceCode;
  price: number | null;
}

/** 고객 수신 — 기사님이 이사 완료 견적의 결제를 요청했습니다 */
export interface PaymentRequestPayload {
  moverNickName: string;
  category: ServiceCode;
  price: number | null;
}

/** 기사님 수신 — 고객이 이사 완료 견적을 결제했습니다 */
export interface PaymentCompletedPayload {
  customerName: string;
  category: ServiceCode;
  price: number | null;
}

/** 기사님 수신 — 고객이 선수금을 결제해 이사가 확정됐습니다 */
export interface DepositPaidPayload {
  customerName: string;
  category: ServiceCode;
  /** 결제한 선수금 */
  amount: number | null;
}

/** 고객·기사님 수신 — 선수금 기한(48시간)을 넘겨 확정이 자동 취소됐습니다 */
export interface DepositExpiredPayload {
  moverNickName: string;
  customerName: string;
  category: ServiceCode;
}

/** 고객 수신 — 기사님이 추가 금액을 요청했습니다 */
export interface ExtraChargeProposedPayload {
  moverNickName: string;
  category: ServiceCode;
  amount: number | null;
}

/** 기사님 수신 — 고객이 추가 금액을 승인·거절했습니다 */
export interface ExtraChargeRespondedPayload {
  customerName: string;
  category: ServiceCode;
  amount: number | null;
  approved: boolean;
}

export interface EstimateConfirmedPayload {
  moverNickName: string;
  customerName: string;
  category: ServiceCode;
}

export interface MovingDayPayload {
  /** 출발·도착 시도. BE가 코드를 주면 문장은 이 값으로 번역합니다. */
  fromRegion?: RegionCode;
  toRegion?: RegionCode;
  /** 코드가 오기 전까지의 주소. 리팩토링 뒤에는 쓰지 않습니다. */
  fromAddress?: string;
  toAddress?: string;
  movingDate: string;
}

/** 받는 사람 기준 상대방 이름 — 메시지 내용은 알림에 싣지 않습니다 */
export interface ChatMessagePayload {
  roomId: number;
  senderName: string;
}

export type NotificationItem =
  | (NotificationBase & { type: "NEW_REQUEST"; payload: NewRequestPayload })
  | (NotificationBase & { type: "NEW_ESTIMATE"; payload: NewEstimatePayload })
  | (NotificationBase & { type: "ESTIMATE_CONFIRMED"; payload: EstimateConfirmedPayload })
  | (NotificationBase & { type: "MOVING_DAY_BEFORE"; payload: MovingDayPayload })
  | (NotificationBase & { type: "MOVING_DAY"; payload: MovingDayPayload })
  | (NotificationBase & { type: "NEW_CHAT_MESSAGE"; payload: ChatMessagePayload })
  | (NotificationBase & { type: "PAYMENT_REQUEST"; payload: PaymentRequestPayload })
  | (NotificationBase & { type: "PAYMENT_COMPLETED"; payload: PaymentCompletedPayload })
  | (NotificationBase & { type: "DEPOSIT_PAID"; payload: DepositPaidPayload })
  | (NotificationBase & { type: "DEPOSIT_EXPIRED"; payload: DepositExpiredPayload })
  | (NotificationBase & { type: "EXTRA_CHARGE_PROPOSED"; payload: ExtraChargeProposedPayload })
  | (NotificationBase & { type: "EXTRA_CHARGE_RESPONDED"; payload: ExtraChargeRespondedPayload });

export interface NotificationListResult {
  items: NotificationItem[];
  nextCursor: number | null;
  unreadCount: number;
}

/** 기사님 전용. 읽지 않은 NEW_REQUEST를 지역·이사 유형으로 묶은 건수입니다. */
export interface NotificationSummaryItem {
  region: RegionCode;
  category: ServiceCode;
  count: number;
}

export interface NotificationSummaryResult {
  items: NotificationSummaryItem[];
  totalCount: number;
}

export interface NotificationListQuery {
  cursor?: number;
  take?: number;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: ["notifications", "list"] as const,
  summary: ["notifications", "summary"] as const,
};

function toQuery(query: NotificationListQuery = {}) {
  const params = new URLSearchParams();
  if (query.cursor) params.set("cursor", String(query.cursor));
  if (query.take) params.set("take", String(query.take));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const notificationService = {
  /** 커서 페이지. BE 기본 take는 10, 상한은 20입니다. */
  list: (query?: NotificationListQuery) =>
    cookieFetch<NotificationListResult>(`/notifications${toQuery(query)}`),

  /** 읽지 않은 견적 요청을 지역·유형별로 집계합니다. 기사님만 200입니다. */
  summary: () => cookieFetch<NotificationSummaryResult>("/notifications/summary"),

  markRead: (id: number) =>
    cookieFetch<{ id: number; isRead: boolean }>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    cookieFetch<{ updatedCount: number }>("/notifications/read-all", { method: "PATCH" }),

  remove: (id: number) =>
    cookieFetch<{ deletedCount: number; deletedIds: number[] }>(`/notifications/${id}`, {
      method: "DELETE",
    }),

  /** 한 번에 최대 50건. 전체 삭제는 이 단위로 나눕니다. */
  removeMany: (ids: number[]) =>
    cookieFetch<{ deletedCount: number; deletedIds: number[] }>("/notifications", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    }),
};
