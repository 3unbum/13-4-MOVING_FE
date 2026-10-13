import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

/** 카드 계열(CardMover·CardRequest 등)과 같은 테두리 그림자 */
export const SKELETON_CARD_SHADOW =
  "shadow-[inset_0_0_0_0.5px_var(--color-line-100),-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]";

/** 카드 안 가로 구분선 */
export const SKELETON_DIVIDER = "h-0 w-full border-0 shadow-[0_0_0_0.5px_var(--color-line-100)]";

/**
 * 스켈레톤 회색 막대. 크기·둥근 모서리는 호출부가 실제 카드 수치에 맞춰 넘긴다.
 */
export default function SkeletonBone({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-hidden className={cn("animate-pulse rounded bg-gray-100", className)} {...props} />
  );
}
