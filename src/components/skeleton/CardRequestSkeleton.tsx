import SkeletonBone, {
  SKELETON_CARD_SHADOW,
  SKELETON_DIVIDER,
} from "@/components/common/SkeletonBone";
import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type CardRequestSkeletonSize = "sm" | "lg";

interface CardRequestSkeletonProps extends HTMLAttributes<HTMLElement> {
  size?: CardRequestSkeletonSize;
  /**
   * actions: 받은 요청 (버튼)
   * price: 고객 견적·이사완료 (금액 줄)
   * none: 반려 요청 (하단 없음)
   */
  footer?: "actions" | "price" | "none";
}

/** `CardRequest`와 같은 패딩·간격의 뼈대 */
export default function CardRequestSkeleton({
  size = "sm",
  footer = "actions",
  className,
  ...props
}: CardRequestSkeletonProps) {
  const isLg = size === "lg";
  const hasHeaderRight = footer !== "none";

  return (
    <article
      className={cn(
        "relative flex flex-col items-start bg-white",
        SKELETON_CARD_SHADOW,
        "w-full",
        isLg ? "gap-8 rounded-[20px] px-10 py-8" : "gap-6 rounded-[20px] px-5 py-6",
        className
      )}
      {...props}
    >
      <div className={cn("flex w-full flex-col items-start", isLg ? "gap-6" : "gap-4")}>
        <div
          className={cn(
            "flex w-full items-center justify-between",
            hasHeaderRight ? "min-h-8.5" : "min-h-8"
          )}
        >
          <SkeletonBone className={isLg ? "h-7 w-20 rounded-md" : "h-6 w-18 rounded"} />
        </div>

        <div className="flex w-full flex-col gap-3">
          <SkeletonBone className="h-8 w-32" />
          <hr className={SKELETON_DIVIDER} />
        </div>

        {isLg ? (
          <SkeletonBone className="h-12.5 w-3/4" />
        ) : (
          <div className="flex w-full flex-col gap-3">
            <SkeletonBone className="h-12.5 w-full" />
            <SkeletonBone className="h-12.5 w-1/2" />
          </div>
        )}
      </div>

      {footer === "price" && (
        <div
          className={cn(
            "border-line-200 flex w-full items-end justify-end border-t",
            isLg ? "h-13" : "h-11.75"
          )}
        >
          <SkeletonBone className={isLg ? "h-8 w-28" : "h-6.5 w-24"} />
        </div>
      )}

      {/*지정 견적 요청 - 반려 버튼*/}
      {footer === "actions" && <SkeletonBone className="h-13.5 w-full rounded-xl" />}
    </article>
  );
}
