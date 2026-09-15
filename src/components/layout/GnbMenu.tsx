"use client";

import xMd from "@/assets/icons/x-md.svg";
import { CUSTOMER_NAV, MOVER_NAV, type GnbNavItem, type GnbRole } from "@/constants/gnb/nav";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

interface GnbMenuProps {
  /** 역할별 기본 메뉴. items를 직접 넘기면 role보다 우선 */
  role?: GnbRole;
  items?: GnbNavItem[];
  isOpen: boolean;
  onClose: () => void;
  /** 메뉴 하단 추가 액션 (비로그인 시 로그인 등) */
  footer?: ReactNode;
  className?: string;
}

export default function GnbMenu({
  role = "customer",
  items,
  isOpen,
  onClose,
  footer,
  className,
}: GnbMenuProps) {
  const menuItems = items ?? (role === "mover" ? MOVER_NAV : CUSTOMER_NAV);

  // Escape 닫기 + 배경 스크롤 락 + 포커스 트랩 — 모달과 같은 useDialog를 쓴다
  // (Notion "Hook 분리 후보 취합"에서 김은진님이 제안하신 항목)
  const { panelRef } = useDialog<HTMLElement>({ open: isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="pc:hidden fixed inset-0 z-[var(--z-gnb)]"
      role="dialog"
      aria-modal="true"
      aria-label="메뉴"
    >
      <button
        type="button"
        className="bg-black-500/40 absolute inset-0"
        aria-label="메뉴 닫기"
        onClick={onClose}
      />
      <nav
        ref={panelRef}
        tabIndex={-1}
        className={cn("absolute top-0 right-0 flex h-full w-55 flex-col bg-gray-50", className)}
      >
        <div className="border-line-100 flex h-13.5 items-center justify-end border-b px-4 py-2.5">
          <button type="button" aria-label="메뉴 닫기" onClick={onClose} className="size-6">
            <Image src={xMd} alt="" width={24} height={24} className="size-6" />
          </button>
        </div>
        <ul className="flex flex-col">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={onClose}
                className="text-16 text-black-500 flex w-full items-center overflow-hidden px-5 py-6 font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {footer ? <li>{footer}</li> : null}
        </ul>
      </nav>
    </div>
  );
}
