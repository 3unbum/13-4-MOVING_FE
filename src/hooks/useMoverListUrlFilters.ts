"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_MOVER_FILTERS } from "@/constants/movers/filters";
import { useDebounce } from "@/hooks/useDebounce";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { MoverListSort } from "@/lib/services/mover-service";
import {
  buildMoverListFilterQuery,
  type MoverListUrlFilters,
} from "@/lib/utils/mover-list-url-filters";

/**
 * 기사님 찾기 필터 ↔ URL 동기화.
 *
 * - 초기값: 서버 page가 searchParams에서 읽어 넘긴 initialFilters
 * - 변경 시: push가 아니라 replace — 필터마다 히스토리가 쌓이면
 *   상세에서 뒤로 갈 때 필터 단계마다 멈춰서 UX가 깨짐
 * - scroll: false — 필터만 바꿔도 스크롤이 맨 위로 튀지 않게
 * - 기본값(전체/기본정렬/빈검색)은 쿼리에서 생략해 URL을 짧게 유지
 * - 검색어는 debounce 중에 URL 동기화를 건너뜀 — 타이핑마다 서버 라운드트립이 생기지 않게
 *   (빈 값은 즉시 반영, 입력 중에는 대기 후 현재 filters로 직렬화)
 */
export function useMoverListUrlFilters(initialFilters: MoverListUrlFilters) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState(initialFilters);

  // UI 입력은 즉시 반영하되 URL 기록만 늦춥니다.
  // 비어 있지 않은데 debounce가 아직 안 따라온 동안은 URL 동기화를 건너뜁니다.
  // (비운 직후 300ms 안에 다시 입력하면 옛 debouncedSearch가 URL에 되살아나는 구멍 방지)
  // 빈 값("")은 pending이 아니라서 지금처럼 바로 쿼리에서 지워집니다.
  const debouncedSearch = useDebounce(filters.search, 300);
  const isSearchPending = filters.search !== "" && filters.search !== debouncedSearch;
  const syncedQuery = buildMoverListFilterQuery(filters);
  const initialQuery = buildMoverListFilterQuery(initialFilters);

  // 현재 URL에 들어가 있다고 보는 쿼리 — state·URL 양방향 동기화의 기준점입니다
  const lastSyncedQuery = useRef(initialQuery);

  // state → URL
  useEffect(() => {
    if (isSearchPending || syncedQuery === lastSyncedQuery.current) {
      return;
    }
    lastSyncedQuery.current = syncedQuery;
    router.replace(syncedQuery ? `${pathname}?${syncedQuery}` : pathname, { scroll: false });
  }, [isSearchPending, pathname, router, syncedQuery]);

  // URL → state. GNB에서 /movers를 다시 누르는 등 외부에서 쿼리가 바뀐 경우를 받습니다
  useEffect(() => {
    if (initialQuery === lastSyncedQuery.current) {
      return;
    }
    lastSyncedQuery.current = initialQuery;
    setFilters(initialFilters);
  }, [initialFilters, initialQuery]);

  const setSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const setRegion = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, region: value }));
  }, []);

  const setService = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, service: value }));
  }, []);

  const setSort = useCallback((value: MoverListSort) => {
    setFilters((prev) => ({ ...prev, sort: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_MOVER_FILTERS });
  }, []);

  return {
    search: filters.search,
    setSearch,
    region: filters.region,
    setRegion,
    service: filters.service,
    setService,
    sort: filters.sort,
    setSort,
    resetFilters,
  };
}
