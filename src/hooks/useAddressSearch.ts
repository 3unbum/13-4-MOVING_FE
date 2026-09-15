"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchAddress } from "@/lib/services/address-service";
import type { AddressSelectResult } from "@/components/address/AddressSelectModal";

// 타이핑 멈추고 이 정도 지나면 검색 — 매 키 입력마다 API 부르지 않으려는 디바운스
const SEARCH_DEBOUNCE_MS = 300;

// 출발지/도착지 하나당 하나씩 붙이는 훅 — 모달 열림 상태, 검색, 선택, 확정값, 상세주소를 한 번에 관리한다.
// 상세주소 입력창 포커스용 ref는 실제 렌더링하는 컴포넌트(모바일/데스크톱) 쪽에서 로컬로 관리한다 —
// 이 훅은 page.tsx에서 한 번만 호출해 모바일/데스크톱이 값을 공유하므로, DOM 노드별로 다른 ref를 여기서 들고 있을 수 없다.
export function useAddressSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<AddressSelectResult[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [value, setValue] = useState<AddressSelectResult>();
  const [detail, setDetail] = useState("");

  const open = useCallback(() => setIsOpen(true), []);

  const abortControllerRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsOpen(false);
    setSearchValue("");
    setResults([]);
    setSelectedId(undefined);
  }, []);

  const search = useCallback(async (query: string) => {
    // 이전 요청이 늦게 도착해 더 최신 검색어 결과를 덮어쓰는 걸 막기 위해, 새 요청 시작 시 이전 요청을 취소한다
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setResults(query.trim() ? await searchAddress(query, controller.signal) : []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setResults([]);
    }
  }, []);

  const onSearchChange = useCallback((query: string) => {
    // 검색어가 바뀌는 순간 이전 검색 결과/선택값은 더 이상 유효하지 않으니 바로 비운다.
    // 실제 API 호출은 기존 debounce(search)가 그대로 처리한다.
    abortControllerRef.current?.abort();
    setSearchValue(query);
    setResults([]);
    setSelectedId(undefined);
  }, []);

  // 모달 열려있는 동안 타이핑하는 대로 결과 목록을 갱신
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => search(searchValue), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [isOpen, searchValue, search]);

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
    selectedId,
    onSelect: (result: AddressSelectResult) => setSelectedId(result.id),
    onConfirm: confirm,
    value,
    detail,
    onDetailChange: setDetail,
  };
}

export type AddressSearchController = ReturnType<typeof useAddressSearch>;
