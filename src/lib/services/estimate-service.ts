import { cookieFetch } from "@/lib/utils/api-client";
import type { ServiceCode } from "@/components/filter/ChipRegion";

export type EstimateStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED";

/** 잔금(이사 완료 후 마지막 결제)의 결제 여부. 결제 대상이 아닌 견적은 항상 UNPAID입니다 */
export type PaymentStatus = "UNPAID" | "PAID";

/**
 * 견적이 지금 어떤 결제 단계인지 — BE가 계산해서 내려줍니다.
 *
 *   DEPOSIT_DUE  확정됐고 선수금을 아직 안 냄 (기한 안에 내야 확정이 유지됩니다)
 *   BALANCE_DUE  이사가 끝났고 잔금을 아직 안 냄
 *   PAID         잔금까지 모두 결제함
 *   NONE         결제할 단계가 아님
 */
export type PaymentStage = "DEPOSIT_DUE" | "BALANCE_DUE" | "PAID" | "NONE";

/**
 * 기사님이 이사 완료 후 요청하는 추가 금액 한 건의 상태. 견적당 여러 건을 보낼 수 있습니다.
 * PROPOSED(고객 응답 대기) → APPROVED(잔금에 합산) | REJECTED(잔금은 그대로)
 */
export type ExtraChargeStatus = "PROPOSED" | "APPROVED" | "REJECTED";

/** 추가 금액 한 건 — 견적당 여러 건이고, 고객이 건별로 승인·거절합니다 */
export interface EstimateExtraCharge {
  id: number;
  amount: number;
  /** 고객이 승인 여부를 판단하는 근거입니다 */
  reason: string;
  status: ExtraChargeStatus;
}

/** 고객의 추가 금액 응답 */
export type ExtraChargeDecision = "APPROVE" | "REJECT";

/** 결제 종류 — 선수금(견적의 10%)과 잔금(견적가 − 선수금)은 서로 다른 결제입니다 */
export type PaymentType = "DEPOSIT" | "BALANCE";

/** 결제 탭 목록: DUE = 대기 중인 결제(선수금 + 잔금), PAID = 결제 내역(잔금까지 완료) */
export type PaymentStageFilter = "DUE" | "PAID";

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
  /** 잔금 결제 여부 */
  paymentStatus: PaymentStatus;
  /** 지금 결제 단계 — 어떤 결제 버튼(선수금/잔금)을 보여줄지 이 값으로 정합니다 */
  paymentStage: PaymentStage;
  /** 선수금(견적의 10%). 확정 전·옛 견적은 null */
  depositAmount: number | null;
  /** 선수금 결제 기한 — 확정 후 48시간, 이사일 0시를 넘지 않습니다 */
  depositDueAt: string | null;
  /** 선수금을 결제한 시각. 미결제면 null */
  depositPaidAt: string | null;
  /** 잔금 = 견적가 − 선수금 + **승인된** 추가 금액 (선수금이 없는 옛 견적은 전액 기준) */
  balanceAmount: number;
  /** 기사님이 요청한 추가 금액 목록(오래된 순). 요청한 적 없으면 빈 배열 */
  extraCharges: EstimateExtraCharge[];
  /** 추가 금액 상한(견적의 20%) — 거절되지 않은 건의 합계에 적용됩니다 */
  extraChargeMax: number;
  /** 아직 더 요청할 수 있는 금액 = 상한 − (응답 대기 + 승인) 합계 */
  extraChargeRemaining: number;
  /** 결제 완료 시각. UNPAID면 null */
  paidAt: string | null;
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

/** 내 견적 목록(결제 탭) — 요청과 무관하게 받은 견적 전체를 결제 여부로 거릅니다 */
/** 결제 탭 정렬 — 최신순 / 오래된 순 */
export type PaySort = "latest" | "oldest";

export interface MyEstimateListQuery extends EstimateListQuery {
  paymentStage?: PaymentStageFilter;
  /** 정렬 — 결제 내역은 결제일, 대기 중인 결제는 이사 완료일 기준 */
  sort?: PaySort;
  /** 월별 조회 — "YYYY-MM". 정렬과 같은 날짜가 그 달인 견적만 */
  month?: string;
}

/** 토스 결제창이 successUrl로 돌려주는 값 그대로 — BE가 토스에 승인을 요청합니다 */
export interface PayEstimateInput {
  type: PaymentType;
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * 견적·결제 종류마다 주문 번호가 하나 — BE가 같은 규칙으로 검증해서 다르면 거절합니다.
 * 선수금과 잔금은 다른 결제라 번호도 다릅니다 (`moving-deposit-12`, `moving-balance-12`).
 * 토스 규칙: 6~64자 영문 대소문자·숫자·`-`·`_`
 */
export const toPaymentOrderId = (estimateId: number, type: PaymentType) =>
  `moving-${type.toLowerCase()}-${estimateId}`;

/**
 * 확정 전에 미리 보여주는 선수금 — 견적 금액의 10%, 10원 단위 내림.
 * **표시용**입니다. 실제 선수금은 BE가 확정 시점에 계산해 저장하고(`calcDepositAmount`),
 * 결제할 때도 BE 값으로 검증합니다. 규칙을 바꾸면 BE와 같이 바꿔야 합니다.
 */
export const calcDepositPreview = (price: number) => Math.floor((price * 0.1) / 10) * 10;

/** 결제 단계에서 지금 낼 결제 종류. 결제할 단계가 아니면 null */
export function paymentTypeOfStage(stage: PaymentStage): PaymentType | null {
  if (stage === "DEPOSIT_DUE") return "DEPOSIT";
  if (stage === "BALANCE_DUE") return "BALANCE";
  return null;
}

/** 결제창이 돌려준 주문 번호에서 결제 종류를 되읽습니다. 우리 규칙이 아니면 null */
export function paymentTypeOfOrderId(orderId: string): PaymentType | null {
  if (orderId.startsWith("moving-deposit-")) return "DEPOSIT";
  if (orderId.startsWith("moving-balance-")) return "BALANCE";
  return null;
}

/**
 * 한 요청이 받을 수 있는 견적 상한 — 일반 5건 + 지정 3명.
 *
 * BE 목록 API의 `take` 기본값이 4라 안 넘기면 뒤쪽 견적이 잘립니다.
 * 이 화면들은 상한이 8로 정해져 있고 피그마에도 더보기 UI가 없어,
 * 페이지네이션 대신 한 번에 전부 받습니다.
 */
export const ESTIMATE_LIMIT_PER_REQUEST = 8;

function toSearchParams(query: MyEstimateListQuery = {}) {
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

export const estimateService = {
  /** 대기 중인 견적 (#26) — 활성 요청이 없으면 빈 배열 */
  getPending: (query?: EstimateListQuery) =>
    cookieFetch<Estimate[]>(`/estimates/pending${toSearchParams(query)}`),

  /** 특정 요청에 받은 견적 (#27) — 받았던 견적 탭에서 요청별로 호출 */
  getByRequest: (quotationRequestId: number, query?: EstimateListQuery) =>
    cookieFetch<Estimate[]>(`/requests/${quotationRequestId}/estimates${toSearchParams(query)}`),

  /** 내 견적 목록 (BE #140) — 대기 중인 결제는 paymentStage=DUE, 결제 내역은 PAID */
  getMine: (query?: MyEstimateListQuery) =>
    cookieFetch<Estimate[]>(`/estimates${toSearchParams(query)}`),

  /** 견적 상세 (#28) */
  getById: (estimateId: number) => cookieFetch<Estimate>(`/estimates/${estimateId}`),

  /** 견적 확정 (#29) */
  confirm: (estimateId: number) =>
    cookieFetch<Estimate>(`/estimates/${estimateId}/confirm`, { method: "POST" }),

  /** 추가 금액 승인·거절 (BE #140) — 고른 건(chargeIds)에 같은 결정을 한 번에 적용합니다. 승인한 건은 잔금에 합산됩니다. 응답하기 전에는 잔금을 결제할 수 없습니다 */
  respondExtraCharge: (estimateId: number, decision: ExtraChargeDecision, chargeIds: number[]) =>
    cookieFetch<Estimate>(`/estimates/${estimateId}/extra-charge/respond`, {
      method: "POST",
      body: JSON.stringify({ decision, chargeIds }),
    }),

  /** 견적 결제 승인 (BE #140) — `type`으로 선수금/잔금을 가르고, 토스페이먼츠 승인 후 기록됩니다 */
  pay: (estimateId: number, input: PayEstimateInput) =>
    cookieFetch<Estimate>(`/estimates/${estimateId}/pay`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};

/** 추가 금액 중 지정한 상태의 건만 */
export function extraChargesByStatus<T extends { extraCharges: EstimateExtraCharge[] }>(
  estimate: T,
  status: ExtraChargeStatus
): EstimateExtraCharge[] {
  return estimate.extraCharges.filter((charge) => charge.status === status);
}

/** 추가 금액 합계 */
export function sumExtraCharges(charges: EstimateExtraCharge[]): number {
  return charges.reduce((sum, charge) => sum + charge.amount, 0);
}
