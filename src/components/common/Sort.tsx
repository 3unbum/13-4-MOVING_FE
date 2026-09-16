"use client";

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
  label = "정렬",
  className,
  disabled = false,
}: SortProps) {
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
        aria-label={`${label}: ${selectedLabel}`}
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
          // 필터형(피그마 Dropdown `1:11544` / `1:11691`) — 테두리 + 좌측 정렬
          isLg &&
            "border-line-200 h-9 w-18.75 gap-1.5 rounded-lg border pr-2.5 pl-3.5 shadow-[4px_4px_5px_0_rgba(238,238,238,0.1)]",
          isXl &&
            "h-12.5 w-40 justify-between rounded-xl border border-gray-100 pr-3 pl-5 shadow-[4px_4px_5px_0_rgba(195,217,242,0.2)]",
          // 정렬형 — 기존 sm·md
          !isDropdown && "justify-center rounded-lg",
          isSm && "gap-0.5 py-1.5 pr-1.5 pl-2",
          !isSm &&
            !isDropdown &&
            "w-[114px] gap-2.5 px-2.5 py-2 shadow-[4px_4px_5px_0_rgba(220,220,220,0.2)]"
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
          aria-label={`${label} 옵션`}
          className={cn(
            "border-line-100 absolute top-full left-0 z-[var(--z-filter-dropdown)] flex flex-col overflow-hidden rounded-lg border bg-gray-50",
            isSm
              ? "mt-1.5 w-[91px]"
              : isLg
                ? "mt-1.5 w-18.75"
                : isXl
                  ? "mt-2 w-40"
                  : "mt-2 w-[114px]"
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
                    "text-black-black-400 hover:bg-background-200 flex w-full items-center bg-gray-50 font-medium",
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
