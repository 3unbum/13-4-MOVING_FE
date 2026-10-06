import SkeletonBone, { SKELETON_CARD_SHADOW } from "@/components/common/SkeletonBone";
import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type CardEstimateSkeletonSize = "sm" | "lg";

interface CardEstimateSkeletonProps extends HTMLAttributes<HTMLElement> {
  size?: CardEstimateSkeletonSize;
  /** pending = CardPendingHistory, history = CardEstimateHistory */
  variant?: "pending" | "history";
}

/** 아바타 + 이름 + 평점 줄 */
function MoverBone() {
  return (
    <>
      <SkeletonBone className="size-12.5 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <SkeletonBone className="h-6.5 w-28" />
        <SkeletonBone className="h-5.5 w-40" />
      </div>
    </>
  );
}

/** 고객 내 견적 카드(`CardPendingHistory` / `CardEstimateHistory`) 뼈대 */
export default function CardEstimateSkeleton({
  size = "sm",
  variant = "pending",
  className,
  ...props
}: CardEstimateSkeletonProps) {
  const isLg = size === "lg";
  const chip = <SkeletonBone className={isLg ? "h-7 w-20 rounded-md" : "h-6 w-18 rounded"} />;
  const price = <SkeletonBone className={isLg ? "h-8 w-28" : "h-6.5 w-24"} />;

  if (variant === "history") {
    return (
      <article
        className={cn("flex flex-col items-end bg-white py-5", "w-full", isLg && "px-2", className)}
        {...props}
      >
        <div className={cn("flex w-full flex-col items-start", isLg ? "gap-5" : "gap-4")}>
          <div className={cn("flex w-full flex-col items-start", isLg ? "gap-5" : "gap-4")}>
            {chip}
            <div className="flex w-full flex-col gap-4">
              <SkeletonBone className="h-6.5 w-3/4" />
              <div className="flex w-full items-end gap-3 rounded-xl py-3 pr-5 pl-3 shadow-[inset_0_0_0_1px_var(--color-gray-300)]">
                <MoverBone />
              </div>
            </div>
          </div>
          <div className="flex h-8 w-full items-center justify-end">{price}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "flex flex-col items-start bg-white",
        SKELETON_CARD_SHADOW,
        "w-full",
        isLg ? "gap-10 rounded-[20px] px-10 py-8" : "gap-7 rounded-[20px] px-5 py-6",
        className
      )}
      {...props}
    >
      <div className="tablet:gap-3 flex w-full flex-col items-start gap-2">
        <div className={cn("flex w-full flex-col items-start", isLg ? "gap-6" : "gap-4")}>
          <div className={cn("flex w-full items-center", isLg ? "min-h-8.5" : "min-h-6.5")}>
            {chip}
          </div>
          <div className="flex w-full flex-col gap-1">
            <SkeletonBone className="h-6.5 w-3/4" />
            <div className="flex w-full items-end gap-3 pt-3 pb-5">
              <MoverBone />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "border-line-200 flex w-full items-end justify-end border-t",
            isLg ? "h-13" : "h-11.75"
          )}
        >
          {price}
        </div>
      </div>

      {/* 대기 중인 견적 - 상세보기·견적 확정하기 버튼 */}
      <div className={cn("flex w-full gap-2.75", !isLg && "flex-col")}>
        <SkeletonBone className="h-[54px] w-full rounded-xl" />
        <SkeletonBone className="h-[54px] w-full rounded-xl" />
      </div>
    </article>
  );
}
