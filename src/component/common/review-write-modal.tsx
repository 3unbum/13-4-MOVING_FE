"use client";

import clsx from "clsx";
import Image from "next/image";
import { useId } from "react";
import starLgActive from "@/assets/icons/star-lg-active.svg";
import starLgDefault from "@/assets/icons/star-lg-default.svg";
import starMdActive from "@/assets/icons/star-md-active.svg";
import starMdDefault from "@/assets/icons/star-md-default.svg";
import Button from "@/component/common/button";
import type { ServiceCode } from "@/component/common/chip-region";
import MoveTypeChip from "@/component/common/chip-move-type";
import InputTextArea from "@/component/common/input-textarea";
import Modal, { ModalHeader } from "@/component/common/modal";
import MoverName from "@/component/common/mover-name";
import MovingInfo from "@/component/common/moving-info";
import ProfileAvatar from "@/component/common/profile-avatar";

type ReviewWriteModalSize = "sm" | "md";

const MIN_REVIEW_LENGTH = 10;

interface ReviewWriteModalProps {
  open: boolean;
  onClose: () => void;
  size?: ReviewWriteModalSize;
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
}

// 리뷰 작성 모달
export default function ReviewWriteModal({
  open,
  onClose,
  size = "md",
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
}: ReviewWriteModalProps) {
  const titleId = useId();
  const isMd = size === "md";
  const isValid = rating > 0 && review.trim().length >= MIN_REVIEW_LENGTH;

  return (
    <Modal
      open={open}
      onClose={onClose}
      position={isMd ? "center" : "bottom"}
      labelledBy={titleId}
      className={
        isMd
          ? "w-150 min-w-150 gap-8 rounded-[32px] p-8"
          : "w-93.75 min-w-93.75 gap-6.5 rounded-t-[32px] px-6 py-8"
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
            <ProfileAvatar src={moverProfileImage} alt={moverNickName} size="sm" />
          </div>

          <hr className="border-line-100 w-full border-t" />

          <MovingInfo
            from={fromAddress}
            to={toAddress}
            movingDate={movingDate}
            size={isMd ? "lg" : "sm"}
          />

          <hr className="border-line-100 w-full border-t" />
        </div>

        <div className="flex w-full flex-col items-start gap-3">
          <p className={clsx("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
            평점을 선택해 주세요
          </p>
          <StarRatingInput size={size} value={rating} onChange={onRatingChange} />
        </div>

        <div className="flex w-full flex-col items-start gap-3">
          <p className={clsx("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
            상세 후기를 작성해 주세요
          </p>
          <InputTextArea
            size={isMd ? "md" : "sm"}
            placeholder="최소 10자 이상 입력해주세요"
            value={review}
            onChange={(event) => onReviewChange(event.target.value)}
          />
        </div>
      </div>

      <Button
        variant="solid"
        size={isMd ? "md" : "sm"}
        className="shrink-0"
        disabled={!isValid}
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
