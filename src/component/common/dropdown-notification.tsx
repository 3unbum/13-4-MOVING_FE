"use client";

import xMd from "@/assets/icons/x-md.svg";
import clsx from "clsx";
import Image from "next/image";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

export interface DropdownNotificationProps {
  /** 패널 헤더 (기본: 알림) */
  header?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
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
 * 알림 **패널만** 담당. 트리거·위치(absolute)는 GNB 등 상위에서 처리.
 *
 * @example
 * <div ref={wrapRef} className="relative">
 *   <button type="button" aria-label="알림" onClick={() => setOpen((v) => !v)}>
 *     <AlarmIcon />
 *   </button>
 *   {open ? (
 *     <DropdownNotification
 *       className="absolute top-full right-0 z-100 mt-2"
 *       containerRef={wrapRef}
 *       onClose={() => setOpen(false)}
 *     >
 *       <DropdownNotificationItem message={...} timeLabel="2시간 전" />
 *     </DropdownNotification>
 *   ) : null}
 * </div>
 */
export default function DropdownNotification({
  header = "알림",
  children,
  size = "md",
  className,
  onClose,
  containerRef,
  closeOnOutsideClick = true,
}: DropdownNotificationProps) {
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
      aria-label="알림"
      className={clsx(
        "border-line-200 inline-flex flex-col overflow-hidden rounded-3xl border bg-gray-50 pt-2.5 shadow-[2px_2px_8px_rgba(0,0,0,0.06)]",
        isSm ? "w-78" : "w-[359px]",
        className
      )}
    >
      <div
        className={clsx(
          "flex w-full items-center justify-between bg-gray-50",
          isSm ? "py-3.5 pr-7 pl-8" : "py-3.5 pr-7 pl-10"
        )}
      >
        <div
          className={clsx("font-bold", isSm ? "text-16 text-black-300" : "text-18 text-black-400")}
        >
          {header}
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={() => onClose?.()}
          className="size-6 shrink-0"
        >
          <Image src={xMd} alt="" width={24} height={24} className="size-6" />
        </button>
      </div>

      <div className="flex w-full flex-col">{children}</div>
    </div>
  );
}

export interface DropdownNotificationItemProps {
  message: ReactNode;
  timeLabel: string;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}

const MESSAGE_WRAP_WIDTH = { md: "w-[279px]", sm: "w-[244px]" } as const;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function DropdownNotificationItem({
  message,
  timeLabel,
  size = "md",
  onClick,
  className,
}: DropdownNotificationItemProps) {
  const isSm = size === "sm";
  const messageRef = useRef<HTMLSpanElement>(null);
  const [wrap, setWrap] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = messageRef.current;
    const row = el?.parentElement;
    if (!el || !row) return;

    let cancelled = false;
    const measure = () => {
      if (cancelled) return;

      const prevWhiteSpace = el.style.whiteSpace;
      const prevWidth = el.style.width;
      el.style.whiteSpace = "nowrap";
      el.style.width = "max-content";
      const textWidth = el.scrollWidth;
      el.style.whiteSpace = prevWhiteSpace;
      el.style.width = prevWidth;

      setWrap(textWidth > row.clientWidth - 32);
    };

    measure();
    void document.fonts.ready.then(measure);

    return () => {
      cancelled = true;
    };
  }, [message, size]);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={clsx(
        "border-line-200 hover:bg-background-300 flex w-full shrink-0 flex-col items-start justify-center gap-0.5 border-b bg-gray-50 text-left last:border-b-0",
        isSm ? "px-8 py-3" : "px-10 py-4",
        className
      )}
    >
      <span
        ref={messageRef}
        className={clsx(
          "text-black-400 font-medium",
          isSm ? "text-14" : "text-16",
          wrap ? clsx("whitespace-normal", MESSAGE_WRAP_WIDTH[size]) : "whitespace-nowrap"
        )}
      >
        {message}
      </span>
      <span
        className={clsx(
          "shrink-0 font-medium whitespace-nowrap text-gray-300",
          isSm ? "text-13" : "text-14"
        )}
      >
        {timeLabel}
      </span>
    </button>
  );
}
