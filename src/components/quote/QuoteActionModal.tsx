"use client";

import clsx from "clsx";
import { useId } from "react";
import Button from "@/components/common/Button";
import type { ServiceCode } from "@/components/filter/ChipRegion";
import MoveTypeChip from "@/components/filter/ChipMoveType";
import InputTextArea from "@/components/common/InputTextarea";
import InputTextField from "@/components/common/InputTextfield";
import Modal, { ModalHeader } from "@/components/common/Modal";
import MovingInfo from "@/components/quote/MovingInfo";

type QuoteActionVariant = "send" | "reject";
type QuoteActionSize = "sm" | "md";

interface QuoteActionModalProps {
  open: boolean;
  onClose: () => void;
  // send: 견적 보내기 / reject: 반려요청
  variant: QuoteActionVariant;
  size?: QuoteActionSize;
  category: ServiceCode;
  // 지정 견적 여부. 이 모달은 지정 견적 전용이라 기본값 true
  isTargeted?: boolean;
  customerName: string;
  fromAddress: string;
  toAddress: string;
  movingDate: string;
  price?: string;
  onPriceChange?: (value: string) => void;
  comment?: string;
  onCommentChange?: (value: string) => void;
  reason?: string;
  onReasonChange?: (value: string) => void;
  onSubmit: () => void;
}

const TITLE: Record<QuoteActionVariant, string> = {
  send: "견적 보내기",
  reject: "반려요청",
};

// 견적 보내기 / 반려요청 모달
export default function QuoteActionModal({
  open,
  onClose,
  variant,
  size = "md",
  category,
  isTargeted = true,
  customerName,
  fromAddress,
  toAddress,
  movingDate,
  price = "",
  onPriceChange,
  comment = "",
  onCommentChange,
  reason = "",
  onReasonChange,
  onSubmit,
}: QuoteActionModalProps) {
  const titleId = useId();
  const isMd = size === "md";
  const isSend = variant === "send";
  const isValid = isSend
    ? price.trim().length > 0 && comment.trim().length >= 10
    : reason.trim().length >= 10;

  return (
    <Modal
      open={open}
      onClose={onClose}
      position={isMd ? "center" : "bottom"}
      labelledBy={titleId}
      className={clsx(
        "px-6 pt-8 pb-10",
        isMd
          ? "w-152 min-w-152 gap-10 rounded-[32px]"
          : "w-93.75 min-w-93.75 gap-6.5 rounded-t-[32px]"
      )}
    >
      <ModalHeader id={titleId} title={TITLE[variant]} size={size} onClose={onClose} />

      <div className="flex min-h-0 w-full flex-1 flex-col gap-6.5 overflow-y-auto">
        <div className="flex w-full flex-col items-start gap-5">
          <div className="flex items-center gap-2">
            <MoveTypeChip variant={category} size={isMd ? "md" : "sm"} />
            {isTargeted && <MoveTypeChip variant="TARGETED" size={isMd ? "md" : "sm"} />}
          </div>

          <p className="text-20 text-black-300 flex w-full min-w-0 items-center gap-1 font-semibold">
            <span className="min-w-0 truncate">{customerName}</span>
            <span className="shrink-0">고객님</span>
          </p>

          <MovingInfo
            from={fromAddress}
            to={toAddress}
            movingDate={movingDate}
            size={isMd ? "lg" : "sm"}
          />

          {isMd && (
            <hr className="h-0 w-full border-0 shadow-[0_0_0_0.5px_var(--color-line-100)]" />
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-4">
          {isSend ? (
            <>
              <p className={clsx("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
                견적가를 입력해 주세요
              </p>
              <InputTextField
                type="text"
                inputMode="numeric"
                size={isMd ? "md" : "sm"}
                placeholder="견적가 입력"
                value={price}
                onChange={(event) => onPriceChange?.(event.target.value.replace(/\D/g, ""))}
              />
              <p className={clsx("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
                코멘트를 입력해 주세요
              </p>
              <InputTextArea
                size={isMd ? "md" : "sm"}
                placeholder="최소 10자 이상 입력해주세요"
                value={comment}
                onChange={(event) => onCommentChange?.(event.target.value)}
              />
            </>
          ) : (
            <>
              <p className={clsx("text-black-300 font-semibold", isMd ? "text-20" : "text-16")}>
                반려 사유를 입력해 주세요
              </p>
              <InputTextArea
                size={isMd ? "md" : "sm"}
                placeholder="최소 10자 이상 입력해주세요"
                value={reason}
                onChange={(event) => onReasonChange?.(event.target.value)}
              />
            </>
          )}
        </div>
      </div>

      <Button
        variant="solid"
        size={isMd ? "lg" : "sm"}
        className="shrink-0"
        disabled={!isValid}
        onClick={onSubmit}
      >
        {isSend ? "견적 보내기" : "반려하기"}
      </Button>
    </Modal>
  );
}
