import SkeletonBone, {
  SKELETON_CARD_SHADOW,
  SKELETON_DIVIDER,
} from "@/components/common/SkeletonBone";
import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type CardMoverSkeletonSize = "sm" | "md" | "lg";

interface CardMoverSkeletonProps extends HTMLAttributes<HTMLElement> {
  size?: CardMoverSkeletonSize;
  /** 찜 목록처럼 선택 체크박스가 있는 카드 */
  selectable?: boolean;
  /** 기사님 찾기처럼 한 줄 소개 아래 설명이 있는 카드 (sm은 설명이 없음) */
  withDescription?: boolean;
}

/** `CardMover`와 같은 패딩·간격·아바타 크기의 뼈대 */
export default function CardMoverSkeleton({
  size = "md",
  selectable = false,
  withDescription = false,
  className,
  ...props
}: CardMoverSkeletonProps) {
  const isLg = size === "lg";
  const isMd = size === "md";

  const cardClass = cn(
    "flex flex-col bg-white",
    SKELETON_CARD_SHADOW,
    "w-full",
    isLg ? "rounded-[20px] px-7 py-6" : "rounded-2xl p-5",
    isMd && "gap-2",
    className
  );

  // 체크박스(size-9)는 그리지 않고 자리만 둬서 헤더 줄 높이를 맞춘다
  const selectSpace = selectable ? <span className="size-9 shrink-0" /> : null;

  if (isLg) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex w-full flex-col items-start gap-3">
          <div className="flex min-h-8.5 w-full items-center justify-between">
            <SkeletonBone className="h-7 w-20 rounded-md" />
            {selectSpace}
          </div>

          <div className="flex w-full items-start gap-5">
            <SkeletonBone className="size-33.5 shrink-0 rounded-full" />
            <div className="flex min-w-px flex-1 flex-col gap-5 self-stretch py-1">
              <div className="flex w-full flex-col">
                <SkeletonBone className="h-8 w-3/4" />
                {withDescription && <SkeletonBone className="mt-1 h-5 w-1/2" />}
              </div>
              <div className="flex flex-col gap-1">
                <SkeletonBone className="h-6.5 w-28" />
                <SkeletonBone className="h-5.5 w-48" />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (isMd) {
    return (
      <article className={cardClass} {...props}>
        <div className="flex items-center justify-between gap-2">
          <SkeletonBone className="h-6 w-18 rounded" />
          {selectSpace}
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col">
            <SkeletonBone className="h-6.5 w-3/4" />
            {withDescription && <SkeletonBone className="mt-1 h-4.5 w-1/2" />}
          </div>

          <hr className={SKELETON_DIVIDER} />

          <div className="flex w-full items-center gap-2">
            <SkeletonBone className="size-12.5 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <SkeletonBone className="h-6 w-24" />
              <SkeletonBone className="h-5.5 w-40" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn(cardClass, "items-end")} {...props}>
      <div className="flex w-full flex-col gap-3">
        <SkeletonBone className="h-6 w-18 rounded" />

        <div className="flex w-full flex-col items-start gap-4">
          <SkeletonBone className="h-6.5 w-full" />
          <div className="flex w-full items-center gap-2">
            <SkeletonBone className="size-12.5 shrink-0 rounded-full" />
            <div className="flex min-w-px flex-1 flex-col gap-1">
              <SkeletonBone className="h-6 w-20" />
              <SkeletonBone className="h-5.5 w-36" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
