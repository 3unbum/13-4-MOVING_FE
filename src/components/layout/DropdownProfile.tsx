"use client";

import clsx from "clsx";
import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";

export interface DropdownProfileOption {
  value: string;
  label: string;
  /** 로그아웃 등 보조 액션 — 하단 구분선 영역 */
  tone?: "default" | "muted";
}

export interface DropdownProfileProps {
  /** 패널 상단 이름 (예: 김가나 고객님) */
  header?: ReactNode;
  options: DropdownProfileOption[];
  /** 옵션 선택 시 호출 — 닫기는 상위에서 onClose/조건부 렌더로 처리 */
  onChange?: (value: string) => void;
  /** 현재 선택값 (하이라이트용, 선택) */
  value?: string;
  size?: "sm" | "md";
  className?: string;
  /** Esc / 바깥 클릭 시 호출 — 상위에서 open을 false로 */
  onClose?: () => void;
  /**
   * 바깥 클릭 판정 영역.
   * 트리거+패널을 감싼 wrapper ref를 넘기면 아이콘 클릭 시 바로 닫히지 않음.
   * 미지정 시 패널 노드만 기준.
   */
  containerRef?: RefObject<HTMLElement | null>;
  /** @default true */
  closeOnOutsideClick?: boolean;
}

/**
 * 프로필 메뉴 **패널만** 담당. 트리거·위치(absolute)는 GNB 등 상위에서 처리.
 *
 * @example
 * <div ref={wrapRef} className="relative">
 *   <button type="button" aria-label="프로필 메뉴" onClick={() => setOpen((v) => !v)}>
 *     <ProfileIcon />
 *   </button>
 *   {open ? (
 *     <DropdownProfile
 *       size="sm"
 *       className="..."
 *       header="김코드 기사님"
 *       options={[...]}
 *       containerRef={wrapRef}
 *       onClose={() => setOpen(false)}
 *       onChange={handleMenu}
 *     />
 *   ) : null}
 * </div>
 */
export default function DropdownProfile({
  header,
  options,
  onChange,
  value,
  size = "md",
  className,
  onClose,
  containerRef,
  closeOnOutsideClick = true,
}: DropdownProfileProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isSm = size === "sm";

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!closeOnOutsideClick) return;
      const boundary = containerRef?.current ?? panelRef.current;
      if (!boundary?.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnOutsideClick, containerRef, onClose]);

  return (
    <div
      ref={panelRef}
      id={listId}
      role="menu"
      aria-label="프로필 메뉴 옵션"
      className={clsx(
        "border-line-200 inline-flex flex-col overflow-hidden border bg-gray-50 shadow-[2px_2px_4px_rgba(224,224,224,0.2)]",
        isSm ? "w-38 rounded-2xl pt-2.5" : "w-62 rounded-2xl pt-4",
        className
      )}
    >
      {header ? (
        <div
          className={clsx(
            "flex w-full items-center gap-0.5 bg-gray-50",
            isSm ? "px-4.5 py-2" : "py-3.5 pr-4 pl-7"
          )}
        >
          <div
            className={clsx(
              "font-bold",
              isSm ? "text-16 text-black-black-400" : "text-18 text-black-300"
            )}
          >
            {header}
          </div>
        </div>
      ) : null}

      <ProfileOptionList
        id={`${listId}-options`}
        options={options}
        value={value}
        size={size}
        onSelect={(nextValue) => onChange?.(nextValue)}
      />
    </div>
  );
}

interface ProfileOptionListProps {
  id: string;
  options: DropdownProfileOption[];
  value?: string;
  size: "sm" | "md";
  onSelect: (value: string) => void;
}

function ProfileOptionList({ id, options, value, size, onSelect }: ProfileOptionListProps) {
  const isSm = size === "sm";
  const defaultOptions = options.filter((option) => option.tone !== "muted");
  const mutedOptions = options.filter((option) => option.tone === "muted");

  return (
    <ul id={id} role="none" className="flex w-full flex-col">
      {defaultOptions.map((option) => (
        <li key={option.value} role="none" className="w-full">
          <button
            type="button"
            role="menuitem"
            onClick={() => onSelect(option.value)}
            className={clsx(
              "text-black-black-400 hover:bg-background-300 flex w-full items-center gap-0.5 bg-gray-50 text-left font-medium",
              isSm ? "text-14 px-4.5 py-2" : "text-16 py-3.5 pr-4 pl-7",
              option.value === value && "bg-background-300"
            )}
          >
            {option.label}
          </button>
        </li>
      ))}

      {mutedOptions.map((option) => (
        <li key={option.value} role="none" className="w-full">
          <button
            type="button"
            role="menuitem"
            onClick={() => onSelect(option.value)}
            className={clsx(
              "border-line-100 hover:bg-background-200 text-gray-gray-500 flex w-full items-center justify-center gap-0.5 border-t bg-gray-50",
              isSm
                ? "text-12 px-4.5 pt-3 pb-3.5 font-normal"
                : "text-14 px-4 pt-3.5 pb-3.5 font-medium"
            )}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
