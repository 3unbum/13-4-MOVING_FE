import SkeletonBone, { SKELETON_CARD_SHADOW } from "@/components/common/SkeletonBone";
import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardWritableReviewSkeletonProps extends HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg";
}

/**
 * `CardWritableReview`와 같은 패딩·간격·아바타 크기의 뼈대.
 * 작성 가능 목록은 한 줄 소개·금액을 내려주지 않아 그 자리는 그리지 않는다.
 */
export default function CardWritableReviewSkeleton({
  size = "sm",
  className,
  ...props
}: CardWritableReviewSkeletonProps) {
  const isLg = size === "lg";
  const isMd = size === "md";
  const isSm = size === "sm";

  const cardClass = cn(
    "flex w-full flex-col bg-white",
    SKELETON_CARD_SHADOW,
    "rounded-[20px]",
    isLg && "gap-6 px-10 py-8",
    isMd && "gap-10 p-8",
    isSm && "gap-5 px-5 py-6",
    className
  );
  const button = (
    <SkeletonBone className={cn("h-[54px] rounded-xl", isLg ? "w-40 shrink-0" : "w-full")} />
  );

  if (isLg) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex w-full items-end gap-6">
          <SkeletonBone className="size-25 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
            <SkeletonBone className="h-6.5 w-28" />
            <SkeletonBone className="h-7 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-5">
          <SkeletonBone className="h-12.5 w-1/2" />
          {button}
        </div>
      </article>
    );
  }

  if (isMd) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-start gap-5">
            <SkeletonBone className="size-20 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
              <SkeletonBone className="h-6.5 w-28" />
              <SkeletonBone className="h-6 w-18 rounded" />
            </div>
          </div>
          <SkeletonBone className="h-12.5 w-3/4" />
        </div>
        {button}
      </article>
    );
  }

  return (
    <article className={cardClass} {...props}>
      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex w-full flex-col items-start gap-3">
          <SkeletonBone className="h-6 w-18 rounded" />
          <div className="flex w-full items-center gap-2">
            <div className="flex min-w-0 flex-1">
              <SkeletonBone className="h-6.5 w-24" />
            </div>
            <SkeletonBone className="size-16 shrink-0 rounded-full" />
          </div>
        </div>
        <div className="flex w-full flex-col items-start justify-center gap-4">
          <SkeletonBone className="h-12 w-2/3" />
          <SkeletonBone className="h-12 w-1/2" />
        </div>
      </div>
      {button}
    </article>
  );
}
