import {
  REGION_LABELS,
  SERVICE_LABELS,
  type RegionCode,
  type ServiceCode,
} from "@/components/filter/ChipRegion";

/**
 * Filter UI는 enum 코드(SEOUL)를 쓰고,
 * GET /movers의 region/service는 한글 라벨(서울)을 받는다.
 * "전체"(ALL)는 쿼리에서 빼서 BE 기본(전체)과 맞춘다.
 */

export function toMoverListRegionParam(region: string): string | undefined {
  if (region === "ALL") {
    return undefined;
  }
  return REGION_LABELS[region as RegionCode];
}

export function toMoverListServiceParam(service: string): string | undefined {
  if (service === "ALL") {
    return undefined;
  }
  return SERVICE_LABELS[service as ServiceCode];
}
