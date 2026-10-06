import SkeletonBone, {
  SKELETON_CARD_SHADOW,
  SKELETON_DIVIDER,
} from "@/components/common/SkeletonBone";
import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardMyReviewSkeletonProps extends HTMLAttributes<HTMLElement> {
  size?: "sm" | "lg";
}

/** `CardMyReview`와 같은 패딩·간격·아바타 크기의 뼈대 */
export default function CardMyReviewSkeleton({
  size = "sm",
  className,
  ...props
}: CardMyReviewSkeletonProps) {
  const isLg = size === "lg";

  const cardClass = cn(
    "flex w-full flex-col bg-white",
    SKELETON_CARD_SHADOW,
    "rounded-[20px]",
    isLg ? "gap-5 p-10" : "gap-4 px-5 py-6",
    className
  );

  const review = (
    <div className="flex w-full flex-col items-start gap-3">
      <SkeletonBone className="h-5 w-25" />
      <SkeletonBone className="h-6.5 w-full" />
    </div>
  );

  if (isLg) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex w-full items-start gap-5">
          <SkeletonBone className="size-20 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
            <SkeletonBone className="h-6.5 w-28" />
            <SkeletonBone className="h-6 w-18 rounded" />
          </div>
        </div>
        <SkeletonBone className="h-12.5 w-1/2" />
        {review}
      </article>
    );
  }

  return (
    <article className={cardClass} {...props}>
      <div className="flex w-full flex-col items-start gap-3">
        <SkeletonBone className="h-6 w-18 rounded" />
        <div className="flex w-full items-center justify-between">
          <SkeletonBone className="h-6.5 w-24" />
          <SkeletonBone className="size-12.5 shrink-0 rounded-full" />
        </div>
      </div>

      <hr className={SKELETON_DIVIDER} />
      <SkeletonBone className="h-10.5 w-full" />
      <hr className={SKELETON_DIVIDER} />

      {review}

      <SkeletonBone className="ml-auto h-4.5 w-28" />
    </article>
  );
}
