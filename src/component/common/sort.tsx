"use client";

import chevronDownSm from "@/assets/icons/chevron-down-sm.svg";
import chevronUpSm from "@/assets/icons/chevron-up-sm.svg";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

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
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}

/**
 * 목록 정렬용 드롭다운 — 리뷰/평점/경력/확정 순
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
  className,
  disabled = false,
}: SortProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isSm = size === "sm";

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? options[0]?.label;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={clsx("relative inline-flex", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-label={`정렬: ${selectedLabel}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          "inline-flex items-center justify-center rounded-lg bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
          isSm
            ? "gap-0.5 py-1.5 pr-1.5 pl-2"
            : "w-[114px] gap-2.5 px-2.5 py-2 shadow-[4px_4px_5px_0_rgba(220,220,220,0.2)]"
        )}
      >
        <span
          className={clsx(
            "text-center whitespace-nowrap",
            isSm
              ? isOpen
                ? "text-12 text-gray-gray-400 font-medium"
                : "text-12 text-black-black-400 font-semibold"
              : isOpen
                ? "text-14 text-gray-gray-400 font-medium"
                : "text-14 text-black-black-400 font-semibold"
          )}
        >
          {selectedLabel}
        </span>
        <Image
          src={isOpen ? chevronUpSm : chevronDownSm}
          alt=""
          width={20}
          height={20}
          className="size-5"
        />
      </button>

      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="정렬 옵션"
          // TODO: z-index 토큰(--z-filter-dropdown) PR 머지 후 z-filter-dropdown으로 교체
          className={clsx(
            "border-line-100 absolute top-full left-0 z-100 flex flex-col overflow-hidden rounded-lg border bg-gray-50",
            isSm ? "mt-1.5 w-[91px]" : "mt-2 w-[114px]"
          )}
        >
          {options.map((option, index) => {
            const isFirst = index === 0;
            const isLast = index === options.length - 1;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className="w-full"
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => handleSelect(option.value)}
                  className={clsx(
                    "text-black-black-400 hover:bg-background-200 flex w-full items-center bg-gray-50 font-medium",
                    isSm ? "text-12 h-8 py-1.5 pr-1.5 pl-2.5" : "text-14 px-3 py-2",
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
