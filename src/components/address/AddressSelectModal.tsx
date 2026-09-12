"use client";

import clsx from "clsx";
import { useId } from "react";
import AddressCard from "@/components/address/AddressCard";
import Button from "@/components/common/Button";
import InputSearchbar from "@/components/common/InputSearchbar";
import Modal, { ModalHeader } from "@/components/common/Modal";

type AddressSelectModalSize = "sm" | "md";

export interface AddressSelectResult {
  // zipCode는 우편번호라 같은 값이 여러 건일 수 있음 — 선택/key는 id 사용
  id: string;
  zipCode: string;
  roadAddress: string;
  lotAddress: string;
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
  selectedId?: string;
  onSelect: (result: AddressSelectResult) => void;
  onConfirm: () => void;
}

// 출발지/도착지 주소 선택 모달
export default function AddressSelectModal({
  open,
  onClose,
  title = "출발지를 선택해주세요",
  size = "md",
  searchValue,
  onSearchChange,
  onSearch,
  results,
  selectedId,
  onSelect,
  onConfirm,
}: AddressSelectModalProps) {
  const titleId = useId();
  const isMd = size === "md";
  const canConfirm = results.some((result) => result.id === selectedId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className={clsx(
        isMd
          ? "w-152 min-w-152 gap-10 rounded-[32px] px-6 pt-8 pb-10"
          : "w-[292px] min-w-[292px] gap-7.5 rounded-3xl px-4 py-6"
      )}
    >
      <ModalHeader id={titleId} title={title} size={size} onClose={onClose} />

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
      </div>

      <Button
        variant="solid"
        size={isMd ? "lg" : "sm"}
        className="shrink-0"
        disabled={!canConfirm}
        onClick={onConfirm}
      >
        선택완료
      </Button>
    </Modal>
  );
}
