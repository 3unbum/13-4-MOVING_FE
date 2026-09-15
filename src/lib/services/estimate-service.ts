import { cookieFetch } from "@/lib/utils/api-client";
import type { ServiceCode } from "@/components/filter/ChipRegion";

export type EstimateStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED";

/** 견적에 딸려오는 기사님 정보 — BE가 moverProfile을 평탄화해서 내려줍니다 (BE #80) */
export interface EstimateMover {
  id: number;
  name: string;
  image: string | null;
  nickName: string;
  career: number;
  /** 한 줄 소개 — 카드 제목으로 씁니다 */
  bio: string;
  avgRating: number;
  reviewCount: number;
  confirmedCount: number;
  favoriteCount: number;
}

export interface Estimate {
  id: number;
  quotationRequestId: number;
  moverId: number;
  /** REJECTED면 null */
  price: number | null;
  comment: string;
  estimateStatus: EstimateStatus;
  createdAt: string;
  updatedAt: string;
  /** 지정 견적 요청으로 받은 견적인지 — BE가 targetedRequests 조인으로 판별 */
  isTargeted: boolean;
  quotationRequest: {
    id: number;
    category: ServiceCode;
    movingDate: string;
    createdAt: string;
  };
  mover: EstimateMover;
}

export interface EstimateListQuery {
  status?: EstimateStatus;
  cursor?: number;
  take?: number;
}

function toSearchParams(query: EstimateListQuery = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.cursor !== undefined) params.set("cursor", String(query.cursor));
  if (query.take !== undefined) params.set("take", String(query.take));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const estimateService = {
  /** 대기 중인 견적 (#26) — 활성 요청이 없으면 빈 배열 */
  getPending: (query?: EstimateListQuery) =>
    cookieFetch<Estimate[]>(`/estimates/pending${toSearchParams(query)}`),

  /** 특정 요청에 받은 견적 (#27) — 받았던 견적 탭에서 요청별로 호출 */
  getByRequest: (quotationRequestId: number, query?: EstimateListQuery) =>
    cookieFetch<Estimate[]>(`/requests/${quotationRequestId}/estimates${toSearchParams(query)}`),

  /** 견적 상세 (#28) */
  getById: (estimateId: number) => cookieFetch<Estimate>(`/estimates/${estimateId}`),

  /** 견적 확정 (#29) */
  confirm: (estimateId: number) =>
    cookieFetch<Estimate>(`/estimates/${estimateId}/confirm`, { method: "POST" }),
};
