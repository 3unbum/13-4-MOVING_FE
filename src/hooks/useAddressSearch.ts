"use client";

import { useCallback, useEffect, useState } from "react";
import { searchAddress } from "@/lib/services/address-service";
import type { AddressSelectResult } from "@/components/address/AddressSelectModal";

// 타이핑 멈추고 이 정도 지나면 검색 — 매 키 입력마다 API 부르지 않으려는 디바운스
const SEARCH_DEBOUNCE_MS = 150;

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

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchValue("");
    setResults([]);
    setSelectedId(undefined);
  }, []);

  const search = useCallback(async (query: string) => {
    setResults(query.trim() ? await searchAddress(query) : []);
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
    onSearchChange: setSearchValue,
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
