"use client";

import { useId } from "react";
import Button from "@/components/common/Button";
import CheckboxButton from "@/components/common/CheckboxButton";
import Chip, { SERVICES, SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";
import Modal, { ModalHeader } from "@/components/common/Modal";

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  moveType?: ServiceCode;
  onMoveTypeChange: (value: ServiceCode) => void;
  isTargetedOnly: boolean;
  onTargetedOnlyChange: (value: boolean) => void;
  isServiceAreaOnly: boolean;
  onServiceAreaOnlyChange: (value: boolean) => void;
  onApply: () => void;
}

// 모바일 필터 바텀시트 (이사 유형 / 지역·견적)
export default function FilterModal({
  open,
  onClose,
  moveType,
  onMoveTypeChange,
  isTargetedOnly,
  onTargetedOnlyChange,
  isServiceAreaOnly,
  onServiceAreaOnlyChange,
  onApply,
}: FilterModalProps) {
  const titleId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      position="bottom"
      labelledBy={titleId}
      className="w-93.75 min-w-93.75 gap-8 rounded-t-[32px] px-6 pt-6 pb-8"
    >
      <ModalHeader id={titleId} title="필터" size="sm" onClose={onClose} />

      <div className="flex min-h-0 w-full flex-1 flex-col items-start gap-7 overflow-y-auto">
        <div className="flex w-full flex-col items-start gap-2">
          <p className="text-16 text-black-black-400 font-semibold">이사 유형</p>
          <div
            className="flex flex-wrap items-center gap-3"
            role="group"
            aria-label="이사 유형 선택"
          >
            {SERVICES.map((service) => (
              <Chip
                key={service}
                size="sm"
                selected={moveType === service}
                onClick={() => onMoveTypeChange(service)}
              >
                {SERVICE_LABELS[service]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <p className="text-16 text-black-black-400 font-semibold">지역 및 견적</p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center">
              <CheckboxButton
                shape="square"
                checked={isTargetedOnly}
                onChange={(event) => onTargetedOnlyChange(event.target.checked)}
              />
              <span className="text-16 text-black-500 font-normal">지정 견적 요청</span>
            </label>
            <label className="flex items-center">
              <CheckboxButton
                shape="square"
                checked={isServiceAreaOnly}
                onChange={(event) => onServiceAreaOnlyChange(event.target.checked)}
              />
              <span className="text-16 text-black-500 font-normal">서비스 가능 지역</span>
            </label>
          </div>
        </div>
      </div>

      <Button variant="solid" size="sm" className="shrink-0" onClick={onApply}>
        조회하기
      </Button>
    </Modal>
  );
}
