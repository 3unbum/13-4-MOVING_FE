"use client";

import calendarMd from "@/assets/icons/calendar-md.svg";
import chevronDownLgDark from "@/assets/icons/chevron-down-lg-dark.svg";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface DropdownDateTriggerProps {
  /** 트리거에 표시할 날짜 텍스트 (포맷은 상위/DatePicker 담당) */
  displayValue?: string;
  /** displayValue 없을 때 대체 텍스트 */
  value?: string;
  /** 미선택 시 placeholder */
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** 열림 상태 (권장: controlled — DatePicker와 상태를 공유) */
  open?: boolean;
  /** 열림/닫힘 변경. 트리거 클릭·Esc·(옵션) 바깥 클릭 시 호출 */
  onOpenChange?: (open: boolean) => void;
  /**
   * DatePicker 패널.
   * open===true 일 때만 그대로 렌더. 크기·위치·z-index·스타일은 children 쪽에서 전부 담당.
   */
  children?: ReactNode;
  /**
   * root 밖 클릭 시 닫기.
   * DatePicker가 portal이면 캘린더 클릭이 바깥으로 잡혀 바로 닫힐 수 있음
   * → 그때는 false로 두고 DatePicker/상위에서 닫을 것.
   * @default true
   */
  closeOnOutsideClick?: boolean;
}

/**
 * 날짜 선택 트리거 — DatePicker(다른 담당)와 조합해서 사용.
 *
 * ## 역할 분담
 * - 이 컴포넌트: 트리거 UI + 열림 상태(open/onOpenChange) + children 조건부 렌더
 * - DatePicker/상위 담당: 패널 크기·위치·z-index·스타일, 날짜 값/포맷, 선택 후 닫기
 *
 * ## 권장 사용 (controlled) 방법 - 다른 좋은 방법이 있다면 그 방향으로 적용하셔도 됩니다.
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [date, setDate] = useState<Date | null>(null);
 *
 * <DropdownDateTrigger
 *   displayValue={date ? format(date, "yyyy년 M월 d일") : undefined}
 *   open={open}
 *   onOpenChange={setOpen}
 * >
 *   <DatePicker
 *     value={date}
 *     onChange={(next) => {
 *       setDate(next);
 *       setOpen(false);
 *     }}
 *   />
 * </DropdownDateTrigger>
 * ```
 *
 * ## portal DatePicker
 * ```tsx
 * <DropdownDateTrigger
 *   open={open}
 *   onOpenChange={setOpen}
 *   closeOnOutsideClick={false}
 * >
 *   <DatePicker ... />
 * </DropdownDateTrigger>
 * ```
 *
 * ## 폭
 * 트리거는 w-full. 피그마 520px는 부모에서 max-w-[520px] 등으로 제한.
 *
 * 루트에 relative가 있으므로, children이 absolute로 직접 배치해도 됨.
 */
export default function DropdownDateTrigger({
  displayValue,
  value,
  placeholder = "날짜를 선택해주세요",
  className,
  disabled = false,
  open,
  onOpenChange,
  children,
  closeOnOutsideClick = true,
}: DropdownDateTriggerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const rootRef = useRef<HTMLDivElement>(null);

  const label = displayValue ?? value ?? placeholder;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!closeOnOutsideClick) return;
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open·옵션 변경 시에만 재구독
  }, [isOpen, closeOnOutsideClick]);

  return (
    <div ref={rootRef} className={clsx("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`날짜 선택: ${label}`}
        onClick={() => setOpen(!isOpen)}
        className={clsx(
          "flex h-[50px] w-full items-center rounded-xl bg-gray-50 py-4 pr-3 pl-5 disabled:cursor-not-allowed disabled:opacity-50",
          isOpen ? "border-2 border-orange-400" : "border border-gray-300"
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Image src={calendarMd} alt="" width={24} height={24} className="size-6 shrink-0" />
          <span className="text-16 text-black-400 truncate font-medium">{label}</span>
        </span>
        <Image src={chevronDownLgDark} alt="" width={36} height={36} className="size-9 shrink-0" />
      </button>

      {isOpen ? children : null}
    </div>
  );
}
