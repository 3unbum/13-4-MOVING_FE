"use client";

import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef } from "react";
import AddressCard from "@/components/address/AddressCard";
import Button from "@/components/common/Button";
import InputSearchbar from "@/components/common/InputSearchbar";
import Modal, { ModalHeader } from "@/components/common/Modal";
import type { RegionCode } from "@/components/filter/ChipRegion";

type AddressSelectModalSize = "sm" | "md";

export interface AddressSelectResult {
  // zipCode는 우편번호라 같은 값이 여러 건일 수 있음 — 선택/key는 id 사용
  id: string;
  zipCode: string;
  roadAddress: string;
  lotAddress: string;
  region: RegionCode;
}

interface AddressSelectModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: AddressSelectModalSize;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch?: (value: string) => void;
  results: AddressSelectResult[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  selectedId?: string;
  onSelect: (result: AddressSelectResult) => void;
  onConfirm: () => void;
}

// 출발지/도착지 주소 선택 모달
export default function AddressSelectModal({
  open,
  onClose,
  title,
  size = "md",
  searchValue,
  onSearchChange,
  onSearch,
  results,
  hasMore,
  onLoadMore,
  selectedId,
  onSelect,
  onConfirm,
}: AddressSelectModalProps) {
  const tFilter = useTranslations("filter");
  const tCommon = useTranslations("common");
  const resolvedTitle = title ?? tFilter("selectAddress");
  const titleId = useId();
  const isMd = size === "md";
  const canConfirm = results.some((result) => result.id === selectedId);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 목록 끝이 보이면 다음 페이지 요청. results가 바뀔 때마다 observer를 새로 만들어,
  // 새 페이지가 붙었는데도 sentinel이 여전히 화면 안이면 바로 다음 페이지를 이어서 부른다.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || !onLoadMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onLoadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [results, hasMore, onLoadMore]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className={cn(
        isMd
          ? "h-160 w-152 min-w-152 gap-10 rounded-4xl px-6 pt-8 pb-10"
          : "h-130 w-73 min-w-73 gap-7.5 rounded-3xl px-4 py-6"
      )}
    >
      <ModalHeader id={titleId} title={resolvedTitle} size={size} onClose={onClose} />

      <div className="flex min-h-0 w-full flex-1 flex-col items-start gap-6 overflow-y-auto">
        <InputSearchbar
          size={isMd ? "md" : "sm"}
          value={searchValue}
          onChange={onSearchChange}
          onSearch={onSearch}
        />

        {results.length > 0 && (
          <div className="flex w-full flex-col gap-4">
            {results.map((result) => (
              <AddressCard
                key={result.id}
                size={size}
                zipCode={result.zipCode}
                roadAddress={result.roadAddress}
                lotAddress={result.lotAddress}
                selected={result.id === selectedId}
                onClick={() => onSelect(result)}
              />
            ))}
          </div>
        )}
        {/* 결과가 전부 필터링돼 비어 있어도 다음 페이지를 이어서 부를 수 있게 조건 밖에 둔다 */}
        <div ref={sentinelRef} className="h-px w-full shrink-0" />
      </div>

      <Button
        variant="solid"
        size={isMd ? "lg" : "sm"}
        className="shrink-0"
        disabled={!canConfirm}
        onClick={onConfirm}
      >
        {tCommon("selectComplete")}
      </Button>
    </Modal>
  );
}
