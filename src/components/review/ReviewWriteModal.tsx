"use client";

import { cn } from "@/lib/utils/cn";
import { useLocale, useTranslations } from "next-intl";
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
import ReviewPhotoField from "@/components/review/ReviewPhotoField";
import {
  MAX_REVIEW_CHIPS,
  buildReviewFromChips,
  parseReviewChips,
} from "@/components/review/ReviewChips";

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
  /** write는 새 리뷰, edit는 이미 작성한 리뷰 */
  mode?: "write" | "edit";
  /** 있으면 사진을 최대 3장 붙이거나 지운다. 미리보기는 이 값을 넘기지 않는다. */
  reviewId?: number;
  initialImageUrls?: string[];
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
  mode = "write",
  reviewId,
  initialImageUrls = [],
}: ReviewWriteModalProps) {
  const t = useTranslations("review");
  // 칩 자동 문장 생성은 한국어 어미 규칙에 묶여 있습니다 (ReviewChips 참고)
  const showChips = useLocale() === "ko";
  const titleId = useId();
  const isMd = size === "md";
  const resolvedPosition = position ?? (isMd ? "center" : "bottom");
  const [imageUrls, setImageUrls] = useState(initialImageUrls);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const isValid = rating > 0 && review.trim().length >= MIN_REVIEW_LENGTH && !isPhotoUploading;
  // 수정 모달은 저장된 문장이 칩 조합과 같으면 그때 고른 칩을 다시 켠다.
  const [selectedChipIds, setSelectedChipIds] = useState(() =>
    showChips ? parseReviewChips(review) : []
  );
  // 칩으로 만든 마지막 문장. 후기가 이와 같을 때만 칩이 본문을 갱신한다.
  const [autoReview, setAutoReview] = useState(() =>
    selectedChipIds.length > 0 ? buildReviewFromChips(selectedChipIds) : ""
  );

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
      <ModalHeader
        id={titleId}
        title={mode === "edit" ? t("editReview") : t("writeReview")}
        size={size}
        onClose={onClose}
      />

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
            {t("ratingPrompt")}
          </p>
          <StarRatingInput size={size} value={rating} onChange={onRatingChange} />
        </div>

        {showChips && (
          <ReviewKeywordChips
            size={size}
            selectedIds={selectedChipIds}
            onToggle={handleToggleChip}
            disabled={isSubmitting}
          />
        )}

        <div className="flex w-full flex-col items-start gap-3">
          <p className={cn("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
            {t("detailPrompt")}
          </p>
          <InputTextArea
            size={isMd ? "md" : "sm"}
            label={t("detailLabel")}
            placeholder={t("detailPlaceholder")}
            maxLength={200}
            value={review}
            onChange={(event) => handleReviewInput(event.target.value)}
            disabled={isSubmitting || isPhotoUploading}
          />
        </div>

        {reviewId != null ? (
          <ReviewPhotoField
            reviewId={reviewId}
            imageUrls={imageUrls}
            onChange={setImageUrls}
            onUploadingChange={setIsPhotoUploading}
            disabled={isSubmitting}
          />
        ) : null}
      </div>

      <Button
        variant="solid"
        size={isMd ? "lg" : "sm"}
        className="shrink-0"
        disabled={!isValid || isSubmitting}
        onClick={onSubmit}
      >
        {mode === "edit" ? t("save") : t("submit")}
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
  const t = useTranslations("review");
  const isMd = size === "md";
  const activeIcon = isMd ? starLgActive : starMdActive;
  const defaultIcon = isMd ? starLgDefault : starMdDefault;

  return (
    <div role="radiogroup" aria-label={t("rating")} className="flex items-start">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={t("ratingStar", { star })}
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
