"use client";

import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useId, useState } from "react";
import starLgActive from "@/assets/icons/star-lg-active.svg";
import starLgDefault from "@/assets/icons/star-lg-default.svg";
import starMdActive from "@/assets/icons/star-md-active.svg";
import starMdDefault from "@/assets/icons/star-md-default.svg";
import Button from "@/components/common/Button";
import type { ServiceCode } from "@/components/filter/ChipRegion";
import MoveTypeChip from "@/components/filter/ChipMoveType";
import InputTextArea from "@/components/common/InputTextarea";
import Modal, { ModalHeader } from "@/components/common/Modal";
import MoverName from "@/components/mover/MoverName";
import MovingInfo from "@/components/quote/MovingInfo";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import ReviewKeywordChips from "@/components/review/ReviewKeywordChips";
import { MAX_REVIEW_CHIPS, buildReviewFromChips } from "@/components/review/ReviewChips";

type ReviewWriteModalSize = "sm" | "md";
type ReviewWriteModalPosition = "center" | "bottom";

const MIN_REVIEW_LENGTH = 10;

interface ReviewWriteModalProps {
  open: boolean;
  onClose: () => void;
  size?: ReviewWriteModalSize;
  // 미지정 시 md는 가운데, sm은 하단. 태블릿 sm은 가운데 + 네 모서리 라운드가 필요해서 따로 받는다.
  position?: ReviewWriteModalPosition;
  category: ServiceCode;
  isTargeted?: boolean;
  moverNickName: string;
  moverProfileImage?: string | null;
  fromAddress: string;
  toAddress: string;
  movingDate: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  review: string;
  onReviewChange: (review: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

// 리뷰 작성 모달
export default function ReviewWriteModal({
  open,
  onClose,
  size = "md",
  position,
  category,
  isTargeted = true,
  moverNickName,
  moverProfileImage,
  fromAddress,
  toAddress,
  movingDate,
  rating,
  onRatingChange,
  review,
  onReviewChange,
  onSubmit,
  isSubmitting = false,
}: ReviewWriteModalProps) {
  const titleId = useId();
  const isMd = size === "md";
  const resolvedPosition = position ?? (isMd ? "center" : "bottom");
  const isValid = rating > 0 && review.trim().length >= MIN_REVIEW_LENGTH;
  const [selectedChipIds, setSelectedChipIds] = useState<string[]>([]);
  // 칩으로 만든 마지막 문장. 후기가 이와 같을 때만 칩이 본문을 갱신한다.
  const [autoReview, setAutoReview] = useState("");

  const applyChips = (nextIds: string[]) => {
    const nextReview = buildReviewFromChips(nextIds);
    setSelectedChipIds(nextIds);
    setAutoReview(nextReview);
    onReviewChange(nextReview);
  };

  const handleToggleChip = (id: string) => {
    const isSelected = selectedChipIds.includes(id);
    if (!isSelected && selectedChipIds.length >= MAX_REVIEW_CHIPS) return;

    const nextIds = isSelected
      ? selectedChipIds.filter((chipId) => chipId !== id)
      : [...selectedChipIds, id];
    applyChips(nextIds);
  };

  const handleReviewInput = (value: string) => {
    onReviewChange(value);
    if (value !== autoReview) {
      setSelectedChipIds([]);
      setAutoReview("");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      position={resolvedPosition}
      labelledBy={titleId}
      className={
        isMd
          ? "w-150 min-w-150 gap-8 rounded-[32px] p-8"
          : cn(
              "w-93.75 min-w-93.75 gap-6.5 px-6 py-8",
              resolvedPosition === "center" ? "rounded-[32px]" : "rounded-t-[32px]"
            )
      }
    >
      <ModalHeader id={titleId} title="리뷰 쓰기" size={size} onClose={onClose} />

      <div className="flex min-h-0 w-full flex-1 flex-col items-start gap-8 overflow-y-auto">
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <MoveTypeChip variant={category} size={isMd ? "md" : "sm"} />
            {isTargeted && <MoveTypeChip variant="TARGETED" size={isMd ? "md" : "sm"} />}
          </div>

          <div className="flex w-full items-center justify-between">
            <MoverName nickName={moverNickName} size={isMd ? "md" : "sm"} />
            <ProfileAvatar src={moverProfileImage} alt={moverNickName} size="50" />
          </div>

          <hr className="h-0 w-full border-0 shadow-[0_0_0_0.5px_var(--color-line-100)]" />

          <MovingInfo
            from={fromAddress}
            to={toAddress}
            movingDate={movingDate}
            size={isMd ? "lg" : "sm"}
          />

          <hr className="h-0 w-full border-0 shadow-[0_0_0_0.5px_var(--color-line-100)]" />
        </div>

        <div className="flex w-full flex-col items-start gap-3">
          <p className={cn("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
            평점을 선택해 주세요
          </p>
          <StarRatingInput size={size} value={rating} onChange={onRatingChange} />
        </div>

        <ReviewKeywordChips
          size={size}
          selectedIds={selectedChipIds}
          onToggle={handleToggleChip}
          disabled={isSubmitting}
        />

        <div className="flex w-full flex-col items-start gap-3">
          <p className={cn("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
            상세 후기를 작성해 주세요
          </p>
          <InputTextArea
            size={isMd ? "md" : "sm"}
            label="상세 후기"
            placeholder="키워드를 고르거나 직접 입력해 주세요 (최소 10자)"
            maxLength={200}
            value={review}
            onChange={(event) => handleReviewInput(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <Button
        variant="solid"
        size={isMd ? "lg" : "sm"}
        className="shrink-0"
        disabled={!isValid || isSubmitting}
        onClick={onSubmit}
      >
        리뷰 등록
      </Button>
    </Modal>
  );
}

function StarRatingInput({
  size,
  value,
  onChange,
}: {
  size: ReviewWriteModalSize;
  value: number;
  onChange: (rating: number) => void;
}) {
  const isMd = size === "md";
  const activeIcon = isMd ? starLgActive : starMdActive;
  const defaultIcon = isMd ? starLgDefault : starMdDefault;

  return (
    <div role="radiogroup" aria-label="평점" className="flex items-start">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star}점`}
          onClick={() => onChange(star)}
        >
          <Image
            src={star <= value ? activeIcon : defaultIcon}
            alt=""
            className={isMd ? "size-9" : "size-6"}
          />
        </button>
      ))}
    </div>
  );
}
