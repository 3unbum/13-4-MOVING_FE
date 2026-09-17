"use client";

import { cn } from "@/lib/utils/cn";
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
  /**
   * 기본은 size를 따릅니다(md 가운데 / sm 바닥). 태블릿처럼 폭은 sm인데 가운데 떠야 하는
   * 화면이 있어 따로 지정할 수 있게 열어둡니다 — 받은 요청 모달이 그렇습니다.
   */
  position?: "center" | "bottom";
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

/**
 * BE `estimate.schema.ts`와 같은 값입니다 — 여기가 느슨하면 서버가 400을 던지고
 * 사용자는 이유를 모른 채 실패합니다. 진짜 방어선은 BE이고 여기는 미리 알려주는 쪽입니다.
 */
const MIN_PRICE = 10000;
const MIN_COMMENT = 10;
const MAX_COMMENT = 200;

/** 10자 미만은 입력 중일 수 있어 조용히 두고, 상한을 넘겼을 때만 문구를 띄웁니다 */
function commentError(value: string) {
  return value.trim().length > MAX_COMMENT ? `${MAX_COMMENT}자 이내로 입력해 주세요` : undefined;
}

// 견적 보내기 / 반려요청 모달
export default function QuoteActionModal({
  open,
  onClose,
  variant,
  size = "md",
  position,
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
  const resolvedPosition = position ?? (isMd ? "center" : "bottom");
  const isSend = variant === "send";
  // 입력은 숫자만 남기므로 빈 문자열이면 NaN이 아니라 0이 됩니다
  const priceValue = Number(price.trim() || 0);
  const isPriceTooLow = price.trim().length > 0 && priceValue < MIN_PRICE;
  const commentLength = (isSend ? comment : reason).trim().length;

  const isValid = isSend
    ? priceValue >= MIN_PRICE && commentLength >= MIN_COMMENT && commentLength <= MAX_COMMENT
    : commentLength >= MIN_COMMENT && commentLength <= MAX_COMMENT;

  return (
    <Modal
      open={open}
      onClose={onClose}
      position={resolvedPosition}
      labelledBy={titleId}
      className={cn(
        "px-6 pt-8 pb-10",
        isMd ? "w-152 min-w-152 gap-10" : "w-93.75 min-w-93.75 gap-6.5",
        // 바닥에 붙을 때만 위쪽만 둥글게 — 가운데 뜨면 네 모서리를 다 돌립니다
        resolvedPosition === "bottom" ? "rounded-t-[32px]" : "rounded-[32px]"
      )}
    >
      <ModalHeader id={titleId} title={TITLE[variant]} size={size} onClose={onClose} />

      {/* 본문·상단블록 gap은 variant와 무관하게 size로만 갈립니다
          (피그마 PC 32/20 · 모바일 20/16 — 견적·반려 4개 노드 모두 동일) */}
      <div
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col overflow-y-auto",
          isMd ? "gap-8" : "gap-5"
        )}
      >
        <div className={cn("flex w-full flex-col items-start", isMd ? "gap-5" : "gap-4")}>
          <div className="flex items-center gap-2">
            <MoveTypeChip variant={category} size={isMd ? "md" : "sm"} />
            {isTargeted && <MoveTypeChip variant="TARGETED" size={isMd ? "md" : "sm"} />}
          </div>

          {/* 이름과 "고객님" 사이 8 — 카드(`CardRequest`)와 같은 값입니다 */}
          <p className="text-20 text-black-300 flex w-full min-w-0 items-center gap-2 font-semibold">
            <span className="min-w-0 truncate">{customerName}</span>
            <span className="shrink-0">고객님</span>
          </p>

          <MovingInfo
            from={fromAddress}
            to={toAddress}
            movingDate={movingDate}
            size={isMd ? "lg" : "sm"}
          />

          {/* 구분선은 PC·모바일 모두 있습니다 (피그마 `1:10684` / `1:10738`) */}
          <hr className="h-0 w-full border-0 shadow-[0_0_0_0.5px_var(--color-line-100)]" />
        </div>

        <div className="flex w-full flex-col items-start gap-4">
          {isSend ? (
            <>
              <p className={cn("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
                견적가를 입력해 주세요
              </p>
              <InputTextField
                type="text"
                inputMode="numeric"
                size={isMd ? "md" : "sm"}
                // 피그마는 높이 54 + 폰트 18인데 컴포넌트 md는 높이 64라, 높이만 덮습니다
                className={isMd ? "[&>div]:h-[54px]" : undefined}
                placeholder="견적가 입력"
                value={price}
                onChange={(event) => onPriceChange?.(event.target.value.replace(/\D/g, ""))}
                errorMessage={
                  isPriceTooLow
                    ? `최소 ${MIN_PRICE.toLocaleString("ko-KR")}원 이상 입력해 주세요`
                    : undefined
                }
              />
              <p className={cn("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
                코멘트를 입력해 주세요
              </p>
              <InputTextArea
                size={isMd ? "md" : "sm"}
                placeholder="최소 10자 이상 입력해주세요"
                value={comment}
                onChange={(event) => onCommentChange?.(event.target.value)}
                errorMessage={commentError(comment)}
              />
            </>
          ) : (
            <>
              <p className={cn("text-black-300 font-semibold", isMd ? "text-20" : "text-16")}>
                반려 사유를 입력해 주세요
              </p>
              <InputTextArea
                size={isMd ? "md" : "sm"}
                placeholder="최소 10자 이상 입력해주세요"
                value={reason}
                onChange={(event) => onReasonChange?.(event.target.value)}
                errorMessage={commentError(reason)}
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
