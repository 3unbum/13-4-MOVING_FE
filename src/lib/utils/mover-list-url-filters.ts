// 기사님 찾기 URL 필터 파싱/직렬화 (순수 함수)
import {
  DEFAULT_MOVER_FILTERS,
  REGION_COLUMNS,
  SERVICE_OPTIONS,
  SORT_OPTIONS,
} from "@/constants/movers/filters";
import type { MoverListSort } from "@/lib/services/mover-service";

const REGION_VALUES = new Set(
  REGION_COLUMNS.flatMap((column) => column.map((option) => option.value))
);
// URL 쿼리는 임의 string이라 Set<string>으로 두고 허용 값인지 검사합니다
const SERVICE_VALUES: Set<string> = new Set(SERVICE_OPTIONS.map((option) => option.value));
const SORT_VALUES: Set<string> = new Set(SORT_OPTIONS.map((option) => option.value));

export type MoverListUrlFilters = {
  search: string;
  region: string;
  service: string;
  sort: MoverListSort;
};

export type MoverListSearchParams = {
  search?: string | string[];
  region?: string | string[];
  service?: string | string[];
  sort?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function parseRegion(raw: string | null): string {
  if (raw && REGION_VALUES.has(raw)) {
    return raw;
  }
  return DEFAULT_MOVER_FILTERS.region;
}

function parseService(raw: string | null): string {
  if (raw && SERVICE_VALUES.has(raw)) {
    return raw;
  }
  return DEFAULT_MOVER_FILTERS.service;
}

function parseSort(raw: string | null): MoverListSort {
  if (raw && SORT_VALUES.has(raw)) {
    return raw as MoverListSort;
  }
  return DEFAULT_MOVER_FILTERS.sort;
}

function parseSearch(raw: string | null): string {
  return raw ?? DEFAULT_MOVER_FILTERS.search;
}

/** 서버 searchParams → 필터 초기값 */
export function parseMoverListSearchParams(
  searchParams: MoverListSearchParams
): MoverListUrlFilters {
  return {
    search: parseSearch(firstParam(searchParams.search)),
    region: parseRegion(firstParam(searchParams.region)),
    service: parseService(firstParam(searchParams.service)),
    sort: parseSort(firstParam(searchParams.sort)),
  };
}

/** 기본값은 쿼리에서 생략해 URL을 짧게 유지합니다 */
export function buildMoverListFilterQuery(filters: MoverListUrlFilters): string {
  const params = new URLSearchParams();

  if (filters.region !== DEFAULT_MOVER_FILTERS.region) {
    params.set("region", filters.region);
  }
  if (filters.service !== DEFAULT_MOVER_FILTERS.service) {
    params.set("service", filters.service);
  }
  if (filters.sort !== DEFAULT_MOVER_FILTERS.sort) {
    params.set("sort", filters.sort);
  }

  // trim은 비어 있는지 판별에만 쓰고, 입력 중 공백은 그대로 남겨 IME·다단어 검색을 깨지 않습니다
  if (filters.search.trim()) {
    params.set("search", filters.search);
  }

  return params.toString();
}
