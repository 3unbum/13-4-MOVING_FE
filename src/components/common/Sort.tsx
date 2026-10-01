"use client";

import { useTranslations } from "next-intl";

import chevronDownLgDark from "@/assets/icons/chevron-down-lg-dark.svg";
import chevronDownSm from "@/assets/icons/chevron-down-sm.svg";
import chevronUpLg from "@/assets/icons/chevron-up-lg.svg";
import chevronUpSm from "@/assets/icons/chevron-up-sm.svg";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { useOutsideClose } from "@/hooks/useOutsideClose";

export interface SortOption {
  value: string;
  label: string;
}

export interface SortProps {
  /** 정렬 옵션 목록 */
  options: SortOption[];
  /** 현재 선택값 */
  value: string;
  /** 선택 변경 시 상위 페이지로 전달 */
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * 접근성 이름. 기본값은 "정렬"이지만 lg·xl은 필터로도 쓰여서
   * 그대로 두면 스크린리더가 정렬로 읽습니다 (예: "견적 상태 필터").
   */
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * 목록 정렬용 드롭다운 — 리뷰/평점/경력/확정 순
 *
 * sm·md는 정렬용(기사님 찾기 등), lg·xl은 피그마 `Dropdown`(필터형)입니다.
 *
 * @example
 * <Sort
 *   size="md"
 *   options={[
 *     { value: "review", label: "리뷰 많은순" },
 *     { value: "rating", label: "평점 높은순" },
 *     { value: "career", label: "경력 높은순" },
 *     { value: "confirmed", label: "확정 많은순" },
 *   ]}
 *   value={sort}
 *   onChange={setSort}
 * />
 */
export default function Sort({
  options,
  value,
  onChange,
  size = "md",
  label,
  className,
  disabled = false,
}: SortProps) {
  const t = useTranslations("common");
  // 기본 "정렬" — 호출부가 label을 주면 그대로 씁니다
  const sortLabel = label ?? t("sort");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isSm = size === "sm";
  // lg·xl은 피그마 `Dropdown`(필터형) — 테두리가 있고 좌측 정렬입니다.
  // sm·md(정렬용)와 스타일 계열이 달라 분기를 따로 둡니다.
  const isLg = size === "lg";
  const isXl = size === "xl";
  const isDropdown = isLg || isXl;

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? options[0]?.label;

  useOutsideClose({
    isOpen,
    onClose: () => setIsOpen(false),
    ref: rootRef,
  });

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-label={`${sortLabel}: ${selectedLabel}`}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
          // 필터형(피그마 Dropdown `1:11544` / `1:11691`) — 테두리 + 좌측 정렬
          // 피그마 `1:11544`는 75×36인데, 그 폭에 들어가는 건 "전체"(24px)뿐입니다.
          // "확정견적"만 돼도 23px 넘쳐 아이콘이 테두리 밖으로 밀립니다(기본값이 "전체"라
          // 여태 안 보였습니다). 75는 최소폭으로 두고 긴 라벨에서는 늘어나게 합니다.
          isLg &&
            "border-line-200 h-9 min-w-18.75 gap-1.5 rounded-lg border pr-2.5 pl-3.5 shadow-[4px_4px_5px_0_rgba(238,238,238,0.1)]",
          isXl &&
            "h-12.5 w-40 justify-between rounded-xl border border-gray-100 pr-3 pl-5 shadow-[4px_4px_5px_0_rgba(195,217,242,0.2)]",
          // 정렬형 — 기존 sm·md
          !isDropdown && "justify-center rounded-lg",
          isSm && "gap-0.5 py-1.5 pr-1.5 pl-2",
          !isSm &&
            !isDropdown &&
            // 피그마 114는 최소폭 — 일본어 "レビューが多い順"(112px)·영어 "Most experienced"(127px)가
            // 고정폭 안에서 두 줄로 접힙니다. 한국어(65px)는 그대로입니다.
            "min-w-[114px] gap-2.5 px-2.5 py-2 shadow-[4px_4px_5px_0_rgba(220,220,220,0.2)]"
        )}
      >
        <span
          className={cn(
            "whitespace-nowrap",
            isDropdown && "text-black-black-400 text-left font-medium",
            isLg && "text-14",
            isXl && "text-16",
            !isDropdown && "text-center",
            !isDropdown &&
              (isSm
                ? isOpen
                  ? "text-12 text-gray-gray-400 font-medium"
                  : "text-12 text-black-black-400 font-semibold"
                : isOpen
                  ? "text-14 text-gray-gray-400 font-medium"
                  : "text-14 text-black-black-400 font-semibold")
          )}
        >
          {selectedLabel}
        </span>
        <Image
          src={
            isXl ? (isOpen ? chevronUpLg : chevronDownLgDark) : isOpen ? chevronUpSm : chevronDownSm
          }
          alt=""
          width={isXl ? 36 : 20}
          height={isXl ? 36 : 20}
          className={cn("shrink-0", isXl ? "size-9" : "size-5")}
        />
      </button>

      {isOpen ? (
        <ul
          id={listId}
          aria-label={`${sortLabel} ${t("options")}`}
          className={cn(
            "border-line-100 absolute top-full left-0 z-[var(--z-filter-dropdown)] flex flex-col overflow-hidden rounded-lg border bg-gray-50",
            isSm
              ? "mt-1.5 min-w-[91px]"
              : isLg
                ? // 버튼이 라벨에 따라 늘어나므로(min-w-18.75) 목록은 그 폭을 그대로 따릅니다.
                  // 루트가 inline-flex라 w-full이 버튼 폭과 같아집니다
                  "mt-1.5 w-full"
                : isXl
                  ? "mt-2 min-w-40"
                  : "mt-2 min-w-[114px]"
          )}
        >
          {options.map((option, index) => {
            const isFirst = index === 0;
            const isLast = index === options.length - 1;

            return (
              <li key={option.value} className="w-full">
                <button
                  type="button"
                  aria-current={option.value === value ? "true" : undefined}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "text-black-black-400 hover:bg-background-200 flex w-full items-center bg-gray-50 font-medium whitespace-nowrap",
                    isSm
                      ? "text-12 h-8 py-1.5 pr-1.5 pl-2.5"
                      : isLg
                        ? "text-14 px-3.5 py-1.5"
                        : isXl
                          ? "text-16 px-5 py-3"
                          : "text-14 px-3 py-2",
                    isFirst && "rounded-t-lg",
                    isLast && "rounded-b-lg"
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
