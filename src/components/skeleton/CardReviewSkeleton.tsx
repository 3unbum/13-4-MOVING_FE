import SkeletonBone from "@/components/common/SkeletonBone";
import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface CardReviewSkeletonProps extends HTMLAttributes<HTMLElement> {
  size?: "sm" | "lg";
}

/** `CardReview`와 같은 상하 패딩·간격의 뼈대 (테두리·그림자 없음) */
export default function CardReviewSkeleton({
  size = "sm",
  className,
  ...props
}: CardReviewSkeletonProps) {
  const isLg = size === "lg";

  return (
    <article
      className={cn(
        "flex w-full flex-col items-start",
        isLg ? "gap-6 py-6" : "gap-4 py-5",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-start gap-2">
        <SkeletonBone className={isLg ? "h-6.5 w-40" : "h-6 w-32"} />
        <SkeletonBone className="h-5 w-25" />
      </div>
      <SkeletonBone className={cn("w-full", isLg ? "h-6.5" : "h-6")} />
    </article>
  );
}

/**
 * `ProgressBar` 자리. 제목은 실제 텍스트를 `title`로 받는다.
 * 상세처럼 제목을 밖에 두는 곳은 넘기지 않는다.
 */
export function ReviewDistributionSkeleton({ title }: { title?: ReactNode }) {
  return (
    <div className="tablet:gap-4 flex w-full flex-col gap-2">
      {title}
      <div className="tablet:flex-row tablet:items-start tablet:justify-between flex flex-col gap-4">
        <div className="flex items-center gap-4.5">
          <SkeletonBone className="h-12 w-16" />
          <SkeletonBone className="h-9.5 w-25" />
        </div>
        <div className="flex flex-col gap-1">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex h-6 items-center gap-4">
              <span className="w-9" />
              <SkeletonBone className="h-2 w-45 rounded-[15px]" />
              <span className="w-9" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
