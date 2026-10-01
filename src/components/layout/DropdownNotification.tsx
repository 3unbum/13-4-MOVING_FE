"use client";

import xMd from "@/assets/icons/x-md.svg";
import type { RegionCode, ServiceCode } from "@/components/filter/ChipRegion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";
import { useOutsideClose } from "@/hooks/useOutsideClose";
import Image from "next/image";
import { Children, useId, useRef, useState, type ReactNode, type RefObject } from "react";

export type NotificationTone = "quote" | "request" | "confirmed" | "moving";

export interface DropdownNotificationProps {
  header?: ReactNode;
  /** 헤더 왼쪽 원형 아이콘. 없으면 종 */
  headerIcon?: ReactNode;
  unreadCount?: number;
  /** 읽지 않은 알림만 보고 있는지. 0건이면 칩 자체를 숨깁니다. */
  unreadOnly?: boolean;
  onUnreadOnlyChange?: (unreadOnly: boolean) => void;
  /** 닫기 옆 글자 칩. 알림이 있을 때만 넘깁니다. */
  onReadAll?: () => void;
  onDeleteAll?: () => void;
  /** 4개 이상일 때 목록 바닥에서 다음 페이지를 붙입니다. */
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  /** 목록 아래. 오늘 새 요청 */
  footer?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
  onClose?: () => void;
  /**
   * 바깥 클릭 판정 영역.
   * 트리거+패널을 감싼 wrapper ref를 넘기면 아이콘 클릭 시 바로 닫히지 않음.
   */
  containerRef?: RefObject<HTMLElement | null>;
  /** @default true */
  closeOnOutsideClick?: boolean;
}

/**
 * 알림 패널. 트리거·위치는 GNB가 잡습니다.
 */
export default function DropdownNotification({
  header,
  headerIcon,
  unreadCount = 0,
  unreadOnly = false,
  onUnreadOnlyChange,
  onReadAll,
  onDeleteAll,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  footer,
  children,
  size = "md",
  className,
  onClose,
  containerRef,
  closeOnOutsideClick = true,
}: DropdownNotificationProps) {
  const tGnb = useTranslations("gnb");
  const t = useTranslations("notification");
  const tCommon = useTranslations("common");
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const confirmTitleId = useId();
  const [confirm, setConfirm] = useState<"read" | "delete" | null>(null);
  const isSm = size === "sm";
  const itemCount = Children.count(children);
  const hasItems = itemCount > 0;
  // 3장까지는 그대로 펼칩니다. 4장부터 패널 안에서 스크롤합니다.
  // 미읽음 필터로 화면에 3장 이하만 있어도, 다음 페이지 미읽음을 받으려면 센티널이 필요합니다.
  const scrolls = itemCount >= 4 || (unreadOnly && hasMore);
  const sentinelRef = useInfiniteScrollTrigger(() => onLoadMore?.(), {
    enabled: scrolls && hasMore && Boolean(onLoadMore),
    isLoading: isLoadingMore,
    root: listRef,
  });

  useOutsideClose({
    isOpen: true,
    onClose: () => onClose?.(),
    ref: containerRef ?? panelRef,
    closeOnOutsideClick,
  });

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label={tGnb("notification")}
      className={cn(
        "border-line-100 relative inline-flex flex-col overflow-hidden rounded-[28px] border bg-gray-50 shadow-[0_8px_28px_rgba(17,17,17,0.08)]",
        isSm ? "w-[min(92vw,420px)]" : "w-[min(92vw,520px)]",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-3.5">
        <span className="bg-background-200 text-black-400 flex size-8 shrink-0 items-center justify-center rounded-full">
          {headerIcon ?? <BellIcon />}
        </span>
        <span
          className={cn("text-black-black-400 min-w-0 font-bold", isSm ? "text-16" : "text-18")}
        >
          {header ?? tGnb("notification")}
        </span>
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {unreadCount > 0 ? (
            <button
              type="button"
              aria-pressed={unreadOnly}
              onClick={() => onUnreadOnlyChange?.(!unreadOnly)}
              className={cn(
                "text-12 rounded-full px-2.5 py-1 font-semibold whitespace-nowrap",
                unreadOnly ? "bg-orange-100 text-orange-400" : "bg-white text-red-200"
              )}
            >
              {t("unreadPill", { count: unreadCount })}
            </button>
          ) : null}
          {onReadAll ? (
            <button
              type="button"
              onClick={() => setConfirm("read")}
              className="text-12 text-black-black-400 rounded-full bg-white px-2.5 py-1 font-semibold whitespace-nowrap"
            >
              {t("readAll")}
            </button>
          ) : null}
          {onDeleteAll ? (
            <button
              type="button"
              onClick={() => setConfirm("delete")}
              className="text-12 rounded-full bg-white px-2.5 py-1 font-semibold whitespace-nowrap text-red-200"
            >
              {t("deleteAll")}
            </button>
          ) : null}
          <button
            type="button"
            aria-label={tCommon("close")}
            onClick={() => onClose?.()}
            className="size-6 shrink-0"
          >
            <Image src={xMd} alt="" width={24} height={24} className="size-6" />
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className={cn(
          "flex w-full flex-col gap-2 px-3 pb-3",
          scrolls && "max-h-[252px] overflow-y-auto"
        )}
      >
        {hasItems ? (
          children
        ) : (
          <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
            <p className="text-16 text-black-black-400 font-bold">{t("emptyTitle")}</p>
            <p className="text-13 text-gray-gray-400 font-medium">{t("emptyDescription")}</p>
          </div>
        )}
        {scrolls && hasMore ? <div ref={sentinelRef} className="h-1 shrink-0" /> : null}
      </div>

      {footer ? <div className="border-line-100 border-t px-3 py-3">{footer}</div> : null}
      {confirm ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 px-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            className="flex w-full flex-col gap-4 rounded-2xl bg-gray-50 px-5 py-5"
          >
            <p id={confirmTitleId} className="text-16 text-black-black-400 font-bold">
              {confirm === "read" ? t("readAllConfirm") : t("deleteAllConfirm")}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="text-14 text-gray-gray-500 rounded-xl px-3 py-2 font-semibold"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm === "read") onReadAll?.();
                  else onDeleteAll?.();
                  setConfirm(null);
                }}
                className={cn(
                  "text-14 rounded-xl px-3 py-2 font-semibold text-white",
                  confirm === "delete" ? "bg-red-200" : "bg-orange-400"
                )}
              >
                {tCommon("confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export interface DropdownNotificationItemProps {
  message: ReactNode;
  description?: ReactNode;
  timeLabel: string;
  tone?: NotificationTone;
  unread?: boolean;
  onClick?: () => void;
  onMarkRead?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function DropdownNotificationItem({
  message,
  description,
  timeLabel,
  tone = "quote",
  unread = false,
  onClick,
  onMarkRead,
  onDelete,
  className,
}: DropdownNotificationItemProps) {
  const t = useTranslations("notification");
  const tCommon = useTranslations("common");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMenu = Boolean(onMarkRead || onDelete);

  useOutsideClose({
    isOpen: menuOpen,
    onClose: () => setMenuOpen(false),
    ref: menuRef,
  });

  return (
    <div
      className={cn(
        "flex items-start rounded-2xl",
        unread ? "bg-orange-100" : "bg-background-100",
        className
      )}
    >
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-start gap-3 px-3 py-3 text-left"
      >
        <ToneIcon tone={tone} />
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span className="text-14 text-black-black-400 font-semibold">{message}</span>
          {description ? (
            <span className="text-12 text-gray-gray-500 font-medium">{description}</span>
          ) : null}
          <span className="text-12 text-gray-gray-400 mt-0.5 font-medium">{timeLabel}</span>
        </span>
        <span
          className={cn(
            "text-12 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 font-semibold whitespace-nowrap",
            unread ? "bg-white text-red-200" : "text-gray-gray-500 bg-white"
          )}
        >
          {unread ? (
            <>
              <span className="size-1.5 rounded-full bg-red-200" />
              {t("unreadStatus")}
            </>
          ) : (
            <>
              <CheckMini />
              {t("read")}
            </>
          )}
        </span>
      </button>

      {hasMenu ? (
        <div ref={menuRef} className="shrink-0 py-3 pr-2">
          <button
            type="button"
            aria-label={tCommon("more")}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setMenuPos({ top: rect.bottom + 6, left: rect.right });
              setMenuOpen((open) => !open);
            }}
            className="text-black-black-400 flex size-6 items-center justify-center"
          >
            <KebabIcon />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              style={{ top: menuPos.top, left: menuPos.left, transform: "translateX(-100%)" }}
              className="border-line-100 fixed z-[var(--z-modal)] flex w-40 flex-col rounded-2xl border bg-gray-50 py-1.5 shadow-[0_8px_24px_rgba(17,17,17,0.12)]"
            >
              {unread && onMarkRead ? (
                <MenuButton
                  icon={<MailIcon />}
                  label={t("markRead")}
                  onClick={() => {
                    setMenuOpen(false);
                    onMarkRead();
                  }}
                />
              ) : null}
              {onDelete ? (
                <MenuButton
                  icon={<TrashIcon className="text-red-200" />}
                  label={t("delete")}
                  danger
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "text-14 flex items-center gap-2 px-3 py-2 text-left font-medium",
        danger ? "text-red-200" : "text-black-black-400"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export interface NotificationSummaryLine {
  id: string;
  region: RegionCode;
  parts: { category: ServiceCode; count: number }[];
}

const SUMMARY_CATEGORY_COLOR: Record<ServiceCode, string> = {
  SMALL: "text-orange-400",
  HOME: "text-[#2f6fed]",
  OFFICE: "text-red-200",
};

export function NotificationFooter({
  summaryTitle,
  summaryHint,
  summaryLines,
  onSummarySelect,
}: {
  summaryTitle?: string;
  summaryHint?: string;
  summaryLines?: NotificationSummaryLine[];
  onSummarySelect?: (id: string) => void;
}) {
  const t = useTranslations("notification");
  const tRegion = useTranslations("region");
  const tService = useTranslations("service");
  // undefined는 고객. 빈 배열은 기사님인데 오늘 새 요청이 없는 경우라 제목은 남깁니다.
  if (summaryLines === undefined) return null;

  return (
    <div className="bg-background-100 flex min-w-0 flex-col gap-1.5 rounded-2xl px-3 py-3">
      <div className="flex items-center gap-1.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#3b82f6]">
          <DocIcon />
        </span>
        <span className="text-13 text-black-black-400 font-bold">{summaryTitle}</span>
      </div>
      <p className="text-12 text-gray-gray-400 leading-snug font-medium">{summaryHint}</p>
      {(summaryLines?.length ?? 0) > 0 ? (
        <ul className="mt-1 flex flex-col gap-1">
          {summaryLines?.map((line) => (
            <li key={line.id}>
              <button
                type="button"
                onClick={() => onSummarySelect?.(line.id)}
                className="text-12 flex w-full flex-wrap items-baseline gap-x-2 gap-y-0.5 text-left"
              >
                <span className="text-black-black-400 font-bold">{tRegion(line.region)}</span>
                {line.parts.map((part) => (
                  <span
                    key={part.category}
                    className={cn("font-semibold", SUMMARY_CATEGORY_COLOR[part.category])}
                  >
                    {tService(part.category)}{" "}
                    <span className="font-bold">{t("summaryCount", { count: part.count })}</span>
                  </span>
                ))}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ToneIcon({ tone }: { tone: NotificationTone }) {
  const styles = {
    quote: "bg-[#ffe8ec] text-red-200",
    request: "bg-[#e7f0ff] text-[#3b82f6]",
    confirmed: "bg-[#e5f8ec] text-[#22a35a]",
    moving: "bg-[#f3e8ff] text-[#8b5cf6]",
  } as const;

  return (
    <span
      className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", styles[tone])}
    >
      {tone === "quote" ? <DocIcon /> : null}
      {tone === "request" ? <PersonIcon /> : null}
      {tone === "confirmed" ? <CheckIcon /> : null}
      {tone === "moving" ? <CalendarIcon /> : null}
    </span>
  );
}

function KebabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5.5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="18.5" r="1.7" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M10 20a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7h11v10H3V7Zm11 3h4l3 3v4h-7v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="1.6" fill="currentColor" />
      <circle cx="17" cy="18" r="1.6" fill="currentColor" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm6 1.5V9h4.5L13 4.5ZM8 13h8v1.5H8V13Zm0 3h6v1.5H8V16Z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1-3.2 3.4-4.8 7-4.8s6 1.6 7 4.8H5Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 3.5V7M16 3.5V7M4 10h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 12.5 10 16.5 18 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 12.5 10 16.5 18 8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 7h14M9 7V5h6v2M8 7l1 13h6l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
