import { cookieFetch } from "@/lib/utils/api-client";
import type { ServiceCode } from "@/components/filter/ChipRegion";

/**
 * 기사님이 보낸 견적의 상태.
 *
 * 화면은 "보낸 견적 조회"와 "반려 요청" 두 탭인데, 앞 탭에는 `PENDING`(보냈고 결과 대기) ·
 * `CONFIRMED`(확정됐고 이사 전) · `COMPLETED`(이사 끝남)가 **함께** 들어갑니다 —
 * 피그마 `1:9297`에 고객 견적 카드(`1:9301` 확정 배지 O / `1:9302` X)와 이사완료 카드가
 * 같은 화면에 섞여 있습니다.
 *
 * 배지 없는 `1:9302`가 `PENDING`입니다. 처음엔 이걸 "확정인데 배지만 없는 것"으로 잘못 읽어
 * PENDING을 아예 안 불렀고, 보낸 견적의 상당수가 화면에서 사라졌습니다 (1차 QA-6).
 */
export type MoverEstimateStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED";

/** 견적에 딸린 견적 요청 — 고객 이름·주소는 BE #88에서 추가됐습니다 */
export interface MoverEstimateRequest {
  id: number;
  category: ServiceCode;
  movingDate: string;
  createdAt: string;
  fromAddress: string;
  toAddress: string;
  /** 카드·상세의 "OOO 고객님" */
  userName: string;
}

/**
 * 견적을 보낸 기사님 — 이 페이지에서는 **항상 본인**입니다.
 *
 * 공유 문구에 넣을 별명만 쓰는데, BE가 고객 화면과 같은 DTO를 쓰다 보니
 * 프로필이 통째로 딸려옵니다. 필요한 것만 선언해 둡니다.
 */
export interface MoverEstimateMover {
  id: number;
  name: string;
  nickName: string;
}

export interface MoverEstimate {
  id: number;
  quotationRequestId: number;
  moverId: number;
  mover: MoverEstimateMover;
  /** 반려 견적은 금액이 없습니다 (BE가 `null`로 둡니다) */
  price: number | null;
  comment: string;
  estimateStatus: MoverEstimateStatus;
  isTargeted: boolean;
  createdAt: string;
  updatedAt: string;
  quotationRequest: MoverEstimateRequest;
}

export interface MoverEstimateListQuery {
  status?: MoverEstimateStatus;
  cursor?: number;
  take?: number;
}

/**
 * 한 번에 받아올 견적 수.
 *
 * BE `take` 기본값이 6이고 상한이 20입니다. 확정 탭은 두 상태를 각각 부르므로
 * 한쪽이 비어도 다른 쪽이 채워지도록 넉넉히 잡습니다.
 */
export const MOVER_ESTIMATE_PAGE_SIZE = 12;

function toSearchParams(query: MoverEstimateListQuery = {}) {
  const params = new URLSearchParams();

  if (query.status) params.set("status", query.status);
  if (query.cursor !== undefined) params.set("cursor", String(query.cursor));
  if (query.take !== undefined) params.set("take", String(query.take));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const moverEstimateService = {
  /** 내 견적 목록 (#33) — status로 확정/반려를 가릅니다 */
  getList: (query?: MoverEstimateListQuery) =>
    cookieFetch<MoverEstimate[]>(`/mover/estimates${toSearchParams(query)}`),

  /** 견적 상세 (#34) — 본인이 보낸 견적만 조회됩니다 */
  getById: (estimateId: number) => cookieFetch<MoverEstimate>(`/mover/estimates/${estimateId}`),
};
