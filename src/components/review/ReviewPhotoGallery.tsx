"use client";

import chevronLeft from "@/assets/icons/chevron-left-md.svg";
import chevronRight from "@/assets/icons/chevron-right-md.svg";
import Modal, { ModalHeader } from "@/components/common/Modal";
import RatingStars from "@/components/common/RatingStars";
import { moverQueryKeys } from "@/constants/query-keys/movers";
import {
  findMoverReview,
  type MoverReviewImageItem,
  type MoverReviewItem,
} from "@/lib/services/mover-service";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function formatCreatedAt(iso: string) {
  const kst = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function maskWriter(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return `${trimmed.slice(0, 1)}****`;
}

interface ReviewPhotoThumbsProps {
  urls: string[];
  onSelect?: (imageUrl: string) => void;
  className?: string;
}

/** 리뷰 카드 안의 사진 줄. 누르면 해당 사진을 연다. */
export function ReviewPhotoThumbs({ urls, onSelect, className }: ReviewPhotoThumbsProps) {
  const t = useTranslations("review");
  if (urls.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {urls.map((url) => {
        const image = <Image src={url} alt="" fill sizes="80px" className="object-cover" />;

        if (!onSelect) {
          return (
            <span
              key={url}
              className="bg-background-200 relative size-16 shrink-0 overflow-hidden rounded-xl"
            >
              {image}
            </span>
          );
        }

        return (
          <button
            key={url}
            type="button"
            onClick={() => onSelect(url)}
            aria-label={t("photoAlt")}
            className="bg-background-200 relative size-16 shrink-0 overflow-hidden rounded-xl"
          >
            {image}
          </button>
        );
      })}
    </div>
  );
}

const STRIP_PREVIEW_COUNT = 8;

interface ReviewPhotoStripProps {
  items: MoverReviewImageItem[];
  onOpen: () => void;
}

/** 기사님 상세 리뷰 사진. 스크롤 없이 8장만 보여주고, 누르면 전체 목록을 연다. */
export function ReviewPhotoStrip({ items, onOpen }: ReviewPhotoStripProps) {
  const t = useTranslations("review");
  if (items.length === 0) return null;

  const preview = items.slice(0, STRIP_PREVIEW_COUNT);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {preview.map((item) => (
        <button
          key={`${item.reviewId}-${item.imageUrl}`}
          type="button"
          onClick={onOpen}
          aria-label={t("photoAlt")}
          className="bg-background-200 relative size-20 shrink-0 overflow-hidden rounded-xl"
        >
          <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
        </button>
      ))}
    </div>
  );
}

interface ReviewPhotoGroup {
  reviewId: number;
  cover: MoverReviewImageItem;
  /** 갤러리 전체 목록에서의 대표 사진 위치 */
  index: number;
  count: number;
}

/** 같은 리뷰 사진은 대표 한 장으로 묶는다. 순서는 처음 나온 리뷰를 유지한다. */
function groupPhotosByReview(items: MoverReviewImageItem[]): ReviewPhotoGroup[] {
  const groups: ReviewPhotoGroup[] = [];
  const indexByReview = new Map<number, number>();

  items.forEach((item, index) => {
    const groupIndex = indexByReview.get(item.reviewId);
    if (groupIndex == null) {
      indexByReview.set(item.reviewId, groups.length);
      groups.push({ reviewId: item.reviewId, cover: item, index, count: 1 });
      return;
    }
    groups[groupIndex].count += 1;
  });

  return groups;
}

interface ReviewPhotoListModalProps {
  open: boolean;
  onClose: () => void;
  items: MoverReviewImageItem[];
  onSelect: (index: number) => void;
}

/** 사진 줄에서 여는 전체 리뷰 사진 목록. 리뷰당 대표 사진 한 장이다. */
export function ReviewPhotoListModal({
  open,
  onClose,
  items,
  onSelect,
}: ReviewPhotoListModalProps) {
  const t = useTranslations("review");
  const titleId = useId();
  const groups = groupPhotosByReview(items);

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="w-full max-w-150 gap-6 rounded-[32px] p-6"
    >
      <ModalHeader id={titleId} title={t("photoListTitle")} size="sm" onClose={onClose} />
      <div className="tablet:grid-cols-4 grid max-h-[70dvh] grid-cols-3 gap-2 overflow-y-auto">
        {groups.map((group) => {
          const extraCount = group.count - 1;

          return (
            <button
              key={group.reviewId}
              type="button"
              onClick={() => onSelect(group.index)}
              aria-label={t("photoAlt")}
              className="bg-background-200 relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={group.cover.imageUrl}
                alt=""
                fill
                sizes="(min-width: 744px) 140px, 30vw"
                className="object-cover"
              />
              {extraCount > 0 ? (
                <span className="text-14 absolute inset-0 flex items-center justify-center bg-black/40 font-semibold text-white">
                  +{extraCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

interface ReviewPhotoModalProps {
  open: boolean;
  onClose: () => void;
  slides: MoverReviewImageItem[];
  initialIndex: number;
  /** 있으면 목록에 없는 리뷰를 추가로 찾는다. */
  moverId?: number;
  knownReviews?: MoverReviewItem[];
  /** 전체 사진 목록으로 돌아간다. */
  onBack?: () => void;
}

/** 사진을 누르면 그 리뷰를 같이 보여 준다. */
export function ReviewPhotoModal({
  open,
  onClose,
  slides,
  initialIndex,
  moverId,
  knownReviews = [],
  onBack,
}: ReviewPhotoModalProps) {
  const t = useTranslations("review");
  const titleId = useId();
  const [index, setIndex] = useState(initialIndex);
  const slide = slides[index];
  const known = knownReviews.find((item) => item.id === slide?.reviewId);
  // 장수 표시와 좌우는 지금 리뷰 사진 안에서만 움직인다.
  const reviewIndexes = slides.flatMap((item, slideIndex) =>
    item.reviewId === slide?.reviewId ? [slideIndex] : []
  );
  const position = reviewIndexes.indexOf(index);

  const reviewQuery = useQuery({
    queryKey: moverQueryKeys.reviewItem(moverId ?? 0, slide?.reviewId ?? 0),
    queryFn: () => findMoverReview(moverId!, slide.reviewId),
    enabled: open && moverId != null && slide != null && known == null,
  });

  const review = known ?? reviewQuery.data ?? null;
  const writer = review ? maskWriter(review.customerName) : "";
  const prevIndex = position > 0 ? reviewIndexes[position - 1] : -1;
  const nextIndex =
    position >= 0 && position < reviewIndexes.length - 1 ? reviewIndexes[position + 1] : -1;

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && prevIndex >= 0) setIndex(prevIndex);
      if (event.key === "ArrowRight" && nextIndex >= 0) setIndex(nextIndex);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prevIndex, nextIndex]);

  if (!slide) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="w-full max-w-150 gap-6 rounded-[32px] p-6"
    >
      <ModalHeader
        id={titleId}
        title={t("photoModalTitle")}
        size="sm"
        onClose={onClose}
        onBack={onBack}
        backLabel={t("photoBack")}
      />

      <div className="bg-background-200 relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <Image
          src={slide.imageUrl}
          alt={t("photoAlt")}
          fill
          sizes="(min-width: 744px) 560px, 100vw"
          className="object-contain"
        />
        {reviewIndexes.length > 1 ? (
          <p className="text-12 absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-white">
            {t("photoPosition", { current: position + 1, total: reviewIndexes.length })}
          </p>
        ) : null}
        {prevIndex >= 0 ? (
          <button
            type="button"
            onClick={() => setIndex(prevIndex)}
            aria-label={t("photoPrev")}
            className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
          >
            <Image src={chevronLeft} alt="" className="size-6" />
          </button>
        ) : null}
        {nextIndex >= 0 ? (
          <button
            type="button"
            onClick={() => setIndex(nextIndex)}
            aria-label={t("photoNext")}
            className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
          >
            <Image src={chevronRight} alt="" className="size-6" />
          </button>
        ) : null}
      </div>

      {review ? (
        <div className="flex flex-col gap-3">
          {writer ? (
            <div className="text-14 flex items-center gap-3">
              <span className="text-black-black-400">{writer}</span>
              <span aria-hidden className="bg-line-200 h-3 w-px" />
              <span className="text-gray-gray-300">{formatCreatedAt(review.createdAt)}</span>
            </div>
          ) : null}
          <RatingStars rating={review.rating} />
          <p className="text-16 text-black-500 whitespace-pre-wrap">{review.comment}</p>
        </div>
      ) : reviewQuery.isPending ? (
        <p className="text-14 text-gray-gray-400">{t("loading")}</p>
      ) : null}
    </Modal>
  );
}
