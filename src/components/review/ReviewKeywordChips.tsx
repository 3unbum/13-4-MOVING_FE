"use client";

import Chip from "@/components/filter/ChipRegion";
import { cn } from "@/lib/utils/cn";
import { MAX_REVIEW_CHIPS, REVIEW_CHIP_GROUPS } from "./ReviewChips";

interface ReviewKeywordChipsProps {
  size: "sm" | "md";
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}

// 리뷰 키워드 칩. 고른 항목으로 후기 문장을 만든다.
export default function ReviewKeywordChips({
  size,
  selectedIds,
  onToggle,
  disabled = false,
}: ReviewKeywordChipsProps) {
  const isMd = size === "md";
  const atMax = selectedIds.length >= MAX_REVIEW_CHIPS;

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div className="flex w-full flex-col gap-1">
        <p className={cn("text-black-300 font-semibold", isMd ? "text-18" : "text-16")}>
          어떤 점이 좋았는지 선택해 주세요
        </p>
        <p className={cn("text-gray-400", isMd ? "text-14" : "text-13")}>
          키워드를 고르면 후기가 자동으로 작성돼요 (최대 {MAX_REVIEW_CHIPS}개)
        </p>
      </div>

      <div
        className={cn("w-full", isMd ? "grid grid-cols-3 gap-x-4 gap-y-5" : "flex flex-col gap-4")}
      >
        {REVIEW_CHIP_GROUPS.map((group) => (
          <div key={group.category} className="flex w-full flex-col gap-2">
            <p className={cn("text-black-400 font-semibold", isMd ? "text-14" : "text-13")}>
              {group.category}
            </p>
            <div className={cn("w-full gap-2", isMd ? "flex flex-col" : "grid grid-cols-2")}>
              {group.chips.map((chip) => {
                const selected = selectedIds.includes(chip.id);
                const chipDisabled = disabled || (!selected && atMax);

                return (
                  <Chip
                    key={chip.id}
                    size="sm"
                    selected={selected}
                    disabled={chipDisabled}
                    aria-label={chip.label}
                    onClick={() => {
                      if (chipDisabled) return;
                      onToggle(chip.id);
                    }}
                    className={cn(
                      "flex w-full items-center justify-center text-center whitespace-normal disabled:cursor-not-allowed disabled:opacity-40",
                      !isMd && "text-13"
                    )}
                  >
                    <span aria-hidden>{chip.emoji}</span> {chip.label}
                  </Chip>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
