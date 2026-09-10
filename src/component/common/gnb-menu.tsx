"use client";

import xMd from "@/assets/icons/x-md.svg";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";

export type GnbRole = "customer" | "mover";

export interface GnbNavItem {
  label: string;
  href: string;
}

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

// TODO: 고객용 메뉴 - 페이지 라우트 확정 후 실제 경로로 교체
export const CUSTOMER_NAV: GnbNavItem[] = [
  { label: "견적 요청", href: "/component-gnb" },
  { label: "기사님 찾기", href: "/" },
  { label: "내 견적 관리", href: "/component-gnb" },
];

// TODO: 기사용 메뉴 - 페이지 라우트 확정 후 실제 경로로 교체
export const MOVER_NAV: GnbNavItem[] = [
  { label: "받은 요청", href: "/component-gnb" },
  { label: "내 견적 관리", href: "/component-gnb" },
];

// TODO: 비로그인 메뉴 - 페이지 라우트 확정 후 실제 경로로 교체
export const LOGOUT_NAV: GnbNavItem[] = [{ label: "기사님 찾기", href: "/component-gnb" }];

export function getGnbNavItems(isLoggedIn: boolean, role: GnbRole): GnbNavItem[] {
  if (!isLoggedIn) return LOGOUT_NAV;
  return role === "mover" ? MOVER_NAV : CUSTOMER_NAV;
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

  // 드로워 열릴 때 배경 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="pc:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="메뉴">
      <button
        type="button"
        className="bg-black-500/40 absolute inset-0"
        aria-label="메뉴 닫기"
        onClick={onClose}
      />
      <nav
        className={clsx("absolute top-0 right-0 flex h-full w-55 flex-col bg-gray-50", className)}
      >
        <div className="border-line-100 flex h-13.5 items-center justify-end border-b px-4 py-2.5">
          <button type="button" aria-label="메뉴 닫기" onClick={onClose} className="size-6">
            <Image src={xMd} alt="" width={24} height={24} className="size-6" />
          </button>
        </div>
        <ul className="flex flex-col">
          {menuItems.map((item) => (
            <li key={item.href}>
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
