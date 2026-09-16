import { cookieFetch } from "@/lib/utils/api-client";
import type { RegionCode, ServiceCode } from "@/components/filter/ChipRegion";

export type QuotationStatus = "PENDING" | "ASSIGNED" | "COMPLETED" | "EXPIRED";

export interface QuotationRequestAddress {
  postalCode: string;
  region: RegionCode;
  address: string;
  detailAddress: string;
}

export interface CreateQuotationRequestPayload {
  category: ServiceCode;
  /** YYYY-MM-DD, 당일 이하 날짜는 BE에서 거부됨 */
  movingDate: string;
  from: QuotationRequestAddress;
  to: QuotationRequestAddress;
}

/** 조회 응답 — 생성 payload와 달리 주소가 `fromXxx`·`toXxx`로 평탄화돼 옵니다 */
export interface QuotationRequest {
  id: number;
  userId: number;
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

/** 요청 이력 조회 페이지 크기 — BE 스키마의 상한값(`limit.max(50)`)입니다 */
const HISTORY_PAGE_LIMIT = 50;

export const quotationRequestService = {
  create: (payload: CreateQuotationRequestPayload) =>
    cookieFetch<{ id: number }>("/quotation-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * 활성 요청 1건 (#16). 없으면 null이 옵니다.
   *
   * 목록(#17)과 같은 경로라 `status=pending`으로 갈립니다 —
   * 이때만 배열이 아니라 객체 하나가 내려옵니다.
   */
  getActive: () => cookieFetch<QuotationRequest | null>("/quotation-requests?status=pending"),

  /**
   * 내 요청 이력 (#17).
   *
   * BE `limit` 기본값이 10이라 안 넘기면 11번째 요청부터 화면에서 누락됩니다.
   * 활성 요청은 동시에 1건만 가능해(`ACTIVE_REQUEST_EXISTS`) 이력이 쌓이는 속도가
   * 느리고 피그마에도 페이지네이션 UI가 없어, BE 최대값(50)으로 한 번에 받습니다.
   *
   * 응답에 `page`·`totalPages`·`totalCount`가 함께 오지만 `cookieFetch`가 `data`만
   * 꺼내므로 배열만 받습니다. 이력이 50건을 넘길 일이 생기면 그때 raw 응답으로
   * `totalPages`를 읽어 페이지네이션 UI를 붙이세요.
   */
  /**
   * 요청 상세 (#18).
   *
   * 견적 상세 화면의 "견적 정보" 블록에 출발지·도착지가 필요한데
   * `GET /estimates/:id`의 `quotationRequest`에는 주소가 없어 여기서 따로 받습니다.
   */
  getById: (quotationRequestId: number) =>
    cookieFetch<QuotationRequest>(`/quotation-requests/${quotationRequestId}`),

  getHistory: (page = 1) =>
    cookieFetch<QuotationRequest[]>(`/quotation-requests?page=${page}&limit=${HISTORY_PAGE_LIMIT}`),
};
