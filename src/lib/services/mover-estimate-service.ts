import { cookieFetch } from "@/lib/utils/api-client";
import type { ServiceCode } from "@/components/filter/ChipRegion";
import type {
  EstimateExtraCharge,
  PaymentStage,
  PaymentStageFilter,
  PaymentStatus,
} from "@/lib/services/estimate-service";

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
  /**
   * 상세 주소·우편번호 — 기사님이 실제로 찾아가는 데 필요합니다 (BE #133).
   * 그 전에 배포된 서버는 내려주지 않아 optional로 둡니다.
   */
  fromPostalCode?: string;
  fromDetailAddress?: string;
  toPostalCode?: string;
  toDetailAddress?: string;
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
  /** 고객의 결제 여부 — 기사님은 이사가 끝난(COMPLETED) 견적에서만 의미가 있습니다 */
  paymentStatus: PaymentStatus;
  /** 고객이 잔금을 결제한 시각. UNPAID면 null */
  paidAt: string | null;
  /** 지금 결제 단계 — 선수금 대기(DEPOSIT_DUE)인지 잔금 대기(BALANCE_DUE)인지 */
  paymentStage: PaymentStage;
  /** 선수금(견적의 10%). 확정 전·옛 견적은 null */
  depositAmount: number | null;
  /** 잔금 = 견적가 − 선수금 + 승인된 추가 금액 */
  balanceAmount: number;
  /** 요청한 추가 금액 목록(오래된 순). 요청한 적 없으면 빈 배열 */
  extraCharges: EstimateExtraCharge[];
  /** 추가 금액 상한(견적의 20%) — 거절되지 않은 건의 합계에 적용됩니다 */
  extraChargeMax: number;
  /** 아직 더 요청할 수 있는 금액 = 상한 − (응답 대기 + 승인) 합계 */
  extraChargeRemaining: number;
  /** 기사님이 결제 요청 알림을 보낸 시각. 견적당 1번만 보낼 수 있어 값이 있으면 이미 보낸 것입니다 */
  paymentRequestedAt: string | null;
  isTargeted: boolean;
  createdAt: string;
  updatedAt: string;
  quotationRequest: MoverEstimateRequest;
}

/** 결제 탭 정렬 — 최신순 / 오래된 순 */
export type MoverEstimateSort = "latest" | "oldest";

export interface MoverEstimateListQuery {
  status?: MoverEstimateStatus;
  /** 결제 탭 — DUE(대기 중인 결제) / PAID(결제 내역) (BE #140) */
  paymentStage?: PaymentStageFilter;
  /** 정렬 — 최신순(기본) / 오래된 순 */
  sort?: MoverEstimateSort;
  /** 월별 조회 — "YYYY-MM". 이사 완료일(이사일)이 그 달인 견적만 */
  month?: string;
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
  if (query.paymentStage) params.set("paymentStage", query.paymentStage);
  if (query.sort) params.set("sort", query.sort);
  if (query.month) params.set("month", query.month);
  if (query.cursor !== undefined) params.set("cursor", String(query.cursor));
  if (query.take !== undefined) params.set("take", String(query.take));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const moverEstimateService = {
  /** 내 견적 목록 (#33) — status로 확정/반려를 가릅니다 */
  getList: (query?: MoverEstimateListQuery) =>
    cookieFetch<MoverEstimate[]>(`/mover/estimates${toSearchParams(query)}`),

  /** 결제 요청 보내기 (BE #140) — 고객에게 알림이 갑니다. 견적당 1번만, 이사 완료 + 미결제일 때만 */
  requestPayment: (estimateId: number) =>
    cookieFetch<MoverEstimate>(`/mover/estimates/${estimateId}/payment-request`, {
      method: "POST",
    }),

  /** 추가 금액 요청 (BE #140) — 이사 완료 + 잔금 미결제일 때 여러 건 가능. 사유는 1~200자, 거절되지 않은 건의 합계가 견적의 20% 이내 */
  proposeExtraCharge: (estimateId: number, input: { amount: number; reason: string }) =>
    cookieFetch<MoverEstimate>(`/mover/estimates/${estimateId}/extra-charge`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** 추가 금액 수정 (BE #140) — 고객이 아직 응답하지 않은 건의 금액·사유만 고칠 수 있습니다 */
  updateExtraCharge: (
    estimateId: number,
    chargeId: number,
    input: { amount: number; reason: string }
  ) =>
    cookieFetch<MoverEstimate>(`/mover/estimates/${estimateId}/extra-charge/${chargeId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  /** 견적 상세 (#34) — 본인이 보낸 견적만 조회됩니다 */
  getById: (estimateId: number) => cookieFetch<MoverEstimate>(`/mover/estimates/${estimateId}`),
};
