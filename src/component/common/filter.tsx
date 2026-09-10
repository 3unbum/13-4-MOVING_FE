"use client";

import chevronDownLgDark from "@/assets/icons/chevron-down-lg-dark.svg";
import chevronDownSmDark from "@/assets/icons/chevron-down-sm-dark.svg";
import chevronUpLgOrange from "@/assets/icons/chevron-up-lg-orange.svg";
import chevronUpSmOrange from "@/assets/icons/chevron-up-sm-orange.svg";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

type FilterBaseProps = {
  /** 현재 선택값 */
  value: string;
  /** 선택 변경 시 상위 페이지로 전달 */
  onChange: (value: string) => void;
  /** 트리거 라벨 — 미지정 시 선택 옵션 라벨 사용 */
  label?: string;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
};

type FilterSingleProps = FilterBaseProps & {
  /** 1열 리스트 (서비스 유형 등) */
  layout?: "single";
  options: FilterOption[];
  columns?: never;
};

type FilterDoubleProps = FilterBaseProps & {
  /** 2열 리스트 (지역 등) */
  layout: "double";
  columns: [FilterOption[], FilterOption[]];
  options?: never;
};

export type FilterProps = FilterSingleProps | FilterDoubleProps;

/**
 * 목록 필터용 드롭다운 — 서비스(1열) / 지역(2열)
 *
 * @example
 * // 서비스 유형 (1열)
 * <Filter
 *   size="md"
 *   options={[
 *     { value: "ALL", label: "전체" },
 *     { value: "SMALL", label: "소형이사" },
 *     { value: "HOME", label: "가정이사" },
 *     { value: "OFFICE", label: "사무실이사" },
 *   ]}
 *   value={service}
 *   onChange={setService}
 * />
 *
 * @example
 * // 지역 (2열)
 * <Filter
 *   layout="double"
 *   size="md"
 *   columns={[leftRegions, rightRegions]}
 *   value={region}
 *   onChange={setRegion}
 * />
 */
export default function Filter(props: FilterProps) {
  const {
    value,
    onChange,
    label,
    size = "md",
    className,
    disabled = false,
    layout = "single",
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isSm = size === "sm";
  const isDouble = layout === "double";

  const flatOptions: FilterOption[] =
    isDouble && props.columns ? [...props.columns[0], ...props.columns[1]] : (props.options ?? []);

  const selectedLabel = flatOptions.find((option) => option.value === value)?.label;
  const triggerLabel = label ?? selectedLabel ?? "선택";

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
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`필터: ${triggerLabel}`}
        className={clsx(
          "flex items-center justify-start border border-solid text-left disabled:cursor-not-allowed disabled:opacity-50",
          isSm
            ? "gap-1.5 rounded-lg py-1.5 pr-2.5 pl-3.5"
            : "h-[50px] w-40 gap-0 rounded-xl py-4 pr-3 pl-5",
          isOpen
            ? isSm
              ? "border-orange-400 bg-orange-100 shadow-[4px_4px_5px_rgba(195,217,242,0.1)]"
              : "border-orange-400 bg-orange-100 shadow-[4px_4px_5px_rgba(195,217,242,0.2)]"
            : isSm
              ? "border-line-200 bg-gray-50 shadow-[4px_4px_5px_rgba(238,238,238,0.1)]"
              : "border-gray-gray-100 bg-gray-50 shadow-[4px_4px_5px_rgba(195,217,242,0.2)]"
        )}
      >
        <span
          className={clsx(
            "text-left font-medium whitespace-nowrap",
            isSm ? "text-14" : "text-16 w-23",
            isOpen ? "text-orange-400" : "text-black-black-400"
          )}
        >
          {triggerLabel}
        </span>
        <Image
          src={
            isOpen
              ? isSm
                ? chevronUpSmOrange
                : chevronUpLgOrange
              : isSm
                ? chevronDownSmDark
                : chevronDownLgDark
          }
          alt=""
          width={isSm ? 20 : 36}
          height={isSm ? 20 : 36}
          className={clsx("shrink-0", isSm ? "size-5" : "ml-auto size-9")}
        />
      </button>

      {isOpen ? (
        isDouble && props.columns ? (
          <DoubleList
            id={listId}
            size={size}
            columns={props.columns}
            value={value}
            onSelect={handleSelect}
          />
        ) : (
          <SingleList
            id={listId}
            size={size}
            options={props.options ?? []}
            value={value}
            onSelect={handleSelect}
          />
        )
      ) : null}
    </div>
  );
}

interface SingleListProps {
  id: string;
  size: "sm" | "md";
  options: FilterOption[];
  value: string;
  onSelect: (value: string) => void;
}

function SingleList({ id, size, options, value, onSelect }: SingleListProps) {
  const isSm = size === "sm";

  return (
    <ul
      id={id}
      aria-label="필터 옵션"
      // TODO: z-index 토큰(--z-filter-dropdown) PR 머지 후 z-filter-dropdown으로 교체
      className={clsx(
        "absolute z-100 flex flex-col overflow-hidden bg-gray-50",
        isSm
          ? "border-line-200 top-[47px] -left-px w-[106px] rounded-lg border shadow-[4px_4px_10px_rgba(191,191,191,0.2)]"
          : "border-line-200 top-[61px] left-0 w-40 rounded-xl border shadow-[4px_4px_5px_rgba(224,224,224,0.25)]"
      )}
    >
      {options.map((option, index) => {
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <li key={option.value}>
            <button
              type="button"
              aria-current={option.value === value ? "true" : undefined}
              onClick={() => onSelect(option.value)}
              className={clsx(
                "text-black-black-400 hover:bg-background-200 flex w-full items-center justify-start bg-gray-50 text-left font-medium",
                isSm ? "text-14 h-10 px-3.5" : "text-16 h-15 pl-5",
                isFirst && (isSm ? "rounded-t-lg" : "rounded-t-xl"),
                isLast && (isSm ? "rounded-b-lg" : "rounded-b-xl")
              )}
            >
              <span className={clsx("shrink-0 text-left", isSm ? "w-[61px]" : "w-23")}>
                {option.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface DoubleListProps {
  id: string;
  size: "sm" | "md";
  columns: [FilterOption[], FilterOption[]];
  value: string;
  onSelect: (value: string) => void;
}

function DoubleList({ id, size, columns, value, onSelect }: DoubleListProps) {
  const isSm = size === "sm";
  const [leftColumn, rightColumn] = columns;
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbHeight = isSm ? 49 : 194;
  const trackInset = isSm ? 13 : 17;
  const [thumbTop, setThumbTop] = useState(trackInset);
  const [showThumb, setShowThumb] = useState(false);

  // 스크롤 썸 위치 재계산 함수
  const updateThumb = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) {
      setShowThumb(false);
      setThumbTop(trackInset);
      return;
    }

    setShowThumb(true);
    const movable = Math.max(clientHeight - trackInset * 2 - thumbHeight, 0);
    setThumbTop(trackInset + (scrollTop / maxScroll) * movable);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });

    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateThumb);
      resizeObserver.disconnect();
    };
    // columns 변경 시 즉 지역 목록·사이즈가 바뀌면 스크롤 썸 위치 재계산
    // eslint-disable-next-line react-hooks/exhaustive-deps -- size/columns 변경 시 재구독
  }, [columns, size, thumbHeight, trackInset]);

  return (
    <div
      id={id}
      role="group"
      aria-label="지역 필터 옵션"
      // TODO: z-index 토큰(--z-filter-dropdown) PR 머지 후 z-filter-dropdown으로 교체
      className={clsx(
        "absolute -left-px z-100 overflow-hidden bg-gray-50",
        isSm
          ? "border-line-200 top-[47px] max-h-45 rounded-lg border shadow-[4px_4px_10px_rgba(191,191,191,0.2)]"
          : "top-[61px] max-h-80 rounded-2xl shadow-[4px_4px_5px_rgba(224,224,224,0.25)]"
      )}
    >
      <div className="relative h-full max-h-[inherit]">
        <div
          ref={scrollRef}
          className={clsx(
            "flex max-h-[inherit] overflow-y-auto",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          <Column options={leftColumn} value={value} onSelect={onSelect} size={size} side="left" />
          <Column
            options={rightColumn}
            value={value}
            onSelect={onSelect}
            size={size}
            side="right"
          />
        </div>
        {showThumb ? (
          <div
            aria-hidden
            className={clsx(
              "bg-gray-gray-200 pointer-events-none absolute rounded-full",
              isSm ? "right-1 w-1" : "right-1.5 w-1.5"
            )}
            style={{ top: thumbTop, height: thumbHeight }}
          />
        ) : null}
      </div>
    </div>
  );
}

interface ColumnProps {
  options: FilterOption[];
  value: string;
  onSelect: (value: string) => void;
  size: "sm" | "md";
  side: "left" | "right";
}

function Column({ options, value, onSelect, size, side }: ColumnProps) {
  const isSm = size === "sm";
  const isLeft = side === "left";

  return (
    <ul className="flex flex-col">
      {options.map((option, index) => {
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <li key={option.value}>
            <button
              type="button"
              aria-current={option.value === value ? "true" : undefined}
              onClick={() => onSelect(option.value)}
              className={clsx(
                "text-black-black-400 hover:bg-background-200 flex items-center justify-start bg-gray-50 text-left font-medium",
                isSm ? "text-14 h-9 w-[75px] px-3.5 py-4" : "text-18 h-16 w-[164px] px-6 py-4",
                isLeft && !isSm && "border-line-200 border-l",
                isLeft && "border-line-200 border-r",
                !isLeft && !isSm && "border-line-200 border-r",
                isFirst && !isSm && "border-line-200 border-t",
                isFirst && isLeft && (isSm ? "rounded-tl-lg" : "rounded-tl-2xl"),
                isFirst && !isLeft && (isSm ? "rounded-tr-lg" : "rounded-tr-2xl"),
                isLast && isLeft && (isSm ? "rounded-bl-lg" : "rounded-bl-2xl"),
                isLast && !isLeft && (isSm ? "rounded-br-lg" : "rounded-br-2xl")
              )}
            >
              <span className="min-w-0 flex-1 text-left">{option.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
