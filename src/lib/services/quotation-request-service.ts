import { cookieFetch } from "@/lib/utils/api-client";
import type { RegionCode } from "@/components/filter/ChipRegion";
import type { ServiceCode } from "@/components/filter/ChipRegion";

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

export const quotationRequestService = {
  create: (payload: CreateQuotationRequestPayload) =>
    cookieFetch<{ id: number }>("/quotation-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
