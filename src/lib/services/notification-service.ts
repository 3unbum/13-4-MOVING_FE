import type { RegionCode, ServiceCode } from "@/components/filter/ChipRegion";
import { cookieFetch } from "@/lib/utils/api-client";

/**
 * 알림 종류. 문장은 BE에 없고, FE가 type + payload + 역할로 만듭니다.
 * 전날·당일은 payload가 같고 type만 다릅니다.
 */
export type NotificationType =
  "NEW_REQUEST" | "NEW_ESTIMATE" | "ESTIMATE_CONFIRMED" | "MOVING_DAY_BEFORE" | "MOVING_DAY";

interface NotificationBase {
  id: number;
  isRead: boolean;
  createdAt: string;
  estimateId: number | null;
  quotationRequestId: number | null;
}

export interface NewRequestPayload {
  category: ServiceCode;
  fromRegion: RegionCode;
  movingDate: string;
}

export interface NewEstimatePayload {
  moverNickName: string;
  category: ServiceCode;
  price: number | null;
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

export type NotificationItem =
  | (NotificationBase & { type: "NEW_REQUEST"; payload: NewRequestPayload })
  | (NotificationBase & { type: "NEW_ESTIMATE"; payload: NewEstimatePayload })
  | (NotificationBase & { type: "ESTIMATE_CONFIRMED"; payload: EstimateConfirmedPayload })
  | (NotificationBase & { type: "MOVING_DAY_BEFORE"; payload: MovingDayPayload })
  | (NotificationBase & { type: "MOVING_DAY"; payload: MovingDayPayload });

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
