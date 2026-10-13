"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { fetchLotLabel, searchAddress } from "@/lib/services/address-service";
import type { AddressSelectResult } from "@/components/address/AddressSelectModal";

// 타이핑 멈추고 이 정도 지나면 검색 — 매 키 입력마다 API 부르지 않으려는 디바운스
const SEARCH_DEBOUNCE_MS = 300;

// 출발지/도착지 하나당 하나씩 붙이는 훅 — 모달 열림 상태, 검색, 선택, 확정값, 상세주소를 한 번에 관리한다.
// 상세주소 입력창 포커스용 ref는 실제 렌더링하는 컴포넌트(모바일/데스크톱) 쪽에서 로컬로 관리한다 —
// 이 훅은 page.tsx에서 한 번만 호출해 모바일/데스크톱이 값을 공유하므로, DOM 노드별로 다른 ref를 여기서 들고 있을 수 없다.
export function useAddressSearch() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<AddressSelectResult[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [value, setValue] = useState<AddressSelectResult>();
  const [detail, setDetail] = useState("");
  const [hasMore, setHasMore] = useState(false);
  // 다음 페이지 요청에 필요한 현재 검색 상태 — 렌더와 무관해서 ref로 둔다
  const pagingRef = useRef<{ query: string; page: number; mode?: string; busy: boolean }>({
    query: "",
    page: 1,
    busy: false,
  });

  const open = useCallback(() => setIsOpen(true), []);

  const abortControllerRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsOpen(false);
    setSearchValue("");
    setResults([]);
    setSelectedId(undefined);
    setHasMore(false);
  }, []);

  const search = useCallback(
    async (query: string) => {
      // 이전 요청이 늦게 도착해 더 최신 검색어 결과를 덮어쓰는 걸 막기 위해, 새 요청 시작 시 이전 요청을 취소한다
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const paging = { query, page: 1, mode: undefined as string | undefined, busy: false };
      pagingRef.current = paging;

      try {
        const first = query.trim()
          ? await searchAddress(query, { locale, signal: controller.signal })
          : { results: [], hasMore: false, mode: undefined };
        paging.mode = first.mode;
        setResults(first.results);
        setHasMore(first.hasMore);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
        setHasMore(false);
      }
    },
    [locale]
  );

  // 무한 스크롤 — 목록 끝 sentinel이 보이면 호출. 같은 페이지 중복 요청은 busy로 막는다.
  const loadMore = useCallback(async () => {
    const paging = pagingRef.current;
    if (paging.busy) return;
    paging.busy = true;
    try {
      const next = await searchAddress(paging.query, {
        page: paging.page + 1,
        mode: paging.mode,
        locale,
        signal: abortControllerRef.current?.signal,
      });
      // 응답 대기 중 새 검색이 시작돼 pagingRef가 교체됐으면 이 결과는 버린다
      if (pagingRef.current !== paging) return;
      paging.page += 1;
      setResults((prev) => {
        const ids = new Set(prev.map((r) => r.id));
        return [...prev, ...next.results.filter((r) => !ids.has(r.id))];
      });
      setHasMore(next.hasMore);
    } catch {
      // 취소 — 새 검색이 이어받는다
    } finally {
      paging.busy = false;
    }
  }, [locale]);

  const onSearchChange = useCallback((query: string) => {
    // 결과 목록은 새 응답이 올 때까지 유지해 타이핑 중 목록이 깜빡이는 걸 막는다(선택값만 초기화).
    // 실제 API 호출은 기존 debounce(search)가 그대로 처리한다.
    abortControllerRef.current?.abort();
    setSearchValue(query);
    setSelectedId(undefined);
  }, []);

  // 모달 열려있는 동안 타이핑하는 대로 결과 목록을 갱신
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => search(searchValue), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [isOpen, searchValue, search]);

  // 외국어로 검색한 결과는 선택한 1건만 지번 라벨을 채운다 — 목록 전체를 채우면 검색마다 구글 호출이 늘어난다
  const onSelect = (result: AddressSelectResult) => {
    setSelectedId(result.id);
    if (!result.label || result.lotLabel !== undefined) return;
    const query = pagingRef.current.query;
    fetchLotLabel(query, result, locale).then((lotLabel) => {
      if (!lotLabel || pagingRef.current.query !== query) return;
      setResults((prev) => prev.map((r) => (r.id === result.id ? { ...r, lotLabel } : r)));
    });
  };

  const confirm = useCallback(() => {
    const picked = results.find((result) => result.id === selectedId);
    if (!picked) return;
    setValue(picked);
    close();
  }, [results, selectedId, close]);

  return {
    isOpen,
    open,
    close,
    searchValue,
    onSearchChange,
    onSearch: search,
    results,
    hasMore,
    onLoadMore: loadMore,
    selectedId,
    onSelect,
    onConfirm: confirm,
    value,
    detail,
    onDetailChange: setDetail,
  };
}

export type AddressSearchController = ReturnType<typeof useAddressSearch>;
