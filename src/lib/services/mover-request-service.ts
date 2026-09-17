import { cookieFetch } from "@/lib/utils/api-client";
import type { RegionCode, ServiceCode } from "@/components/filter/ChipRegion";
import type { QuotationStatus } from "@/lib/services/quotation-request-service";

/**
 * 기사님이 받은 견적 요청.
 *
 * `userName`은 BE가 `user`를 조인해 평탄화한 값입니다(BE #88). 카드에 "OOO 고객님"이
 * 들어가는데 원래는 `userId`만 내려와 이름을 채울 수 없었습니다.
 */
export interface MoverRequest {
  id: number;
  userId: number;
  userName: string;
  category: ServiceCode;
  movingDate: string;
  fromPostalCode: string;
  fromRegion: RegionCode;
  fromAddress: string;
  fromDetailAddress: string;
  toPostalCode: string;
  toRegion: RegionCode;
  toAddress: string;
  toDetailAddress: string;
  quotationStatus: QuotationStatus;
  createdAt: string;
  updatedAt: string;
}

/** 피그마 드롭다운은 두 개뿐입니다 — BE의 `targetedAt`(지정받은 시점순)은 쓰지 않습니다 */
export type MoverRequestSort = "latest" | "movingDate";

export interface MoverRequestListQuery {
  /** 이사 유형 칩 */
  category?: ServiceCode;
  /** "서비스 가능 지역" 체크박스 */
  isServiceRegion?: boolean;
  /** "지정 견적 요청" 체크박스 */
  isTargeted?: boolean;
  /** `latest` 최근 요청순(기본) / `movingDate` 이사 빠른순 */
  sort?: MoverRequestSort;
  /** 고객 이름 부분 검색 — BE가 빈 문자열을 "검색 안 함"으로 처리합니다 */
  search?: string;
  cursor?: number;
  take?: number;
}

/**
 * 한 번에 받아올 요청 수.
 *
 * BE `take` 기본값이 6이라 안 넘기면 7번째부터 잘립니다. 상한은 20입니다.
 */
export const MOVER_REQUEST_PAGE_SIZE = 12;

export interface SendEstimatePayload {
  /** 최소 10,000원 (BE 검증) */
  price: number;
  /** 10~200자 (BE 검증) */
  comment: string;
}

export interface RejectRequestPayload {
  /** 반려 사유 — 10~200자 */
  comment: string;
}

function toSearchParams(query: MoverRequestListQuery = {}) {
  const params = new URLSearchParams();

  if (query.category) params.set("category", query.category);
  // BE가 "true"/"false" 문자열만 받습니다(zod enum). false는 기본값이라 아예 안 보냅니다.
  if (query.isServiceRegion) params.set("isServiceRegion", "true");
  if (query.isTargeted) params.set("isTargeted", "true");
  if (query.sort) params.set("sort", query.sort);
  if (query.search) params.set("search", query.search);
  if (query.cursor !== undefined) params.set("cursor", String(query.cursor));
  if (query.take !== undefined) params.set("take", String(query.take));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const moverRequestService = {
  /** 받은 요청 목록 (#30) — 아직 견적을 보내지 않은 PENDING 요청만 옵니다 */
  getList: (query?: MoverRequestListQuery) =>
    cookieFetch<MoverRequest[]>(`/mover/requests${toSearchParams(query)}`),

  /** 견적 보내기 (#31) */
  sendEstimate: (requestId: number, payload: SendEstimatePayload) =>
    cookieFetch<unknown>(`/mover/requests/${requestId}/estimates`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** 요청 반려 (#32) — 반려는 금액 없이 사유만 보냅니다 */
  reject: (requestId: number, payload: RejectRequestPayload) =>
    cookieFetch<unknown>(`/mover/requests/${requestId}/reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
