"use client";

import xMd from "@/assets/icons/x-md.svg";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { CUSTOMER_NAV, MOVER_NAV, type GnbNavItem, type GnbRole } from "@/constants/gnb/nav";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/utils/cn";
import { getGnbNavColorClass, isGnbNavActive } from "@/lib/utils/gnb-nav";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
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
  const tNav = useTranslations("gnb.nav");
  const t = useTranslations("gnb");
  const menuItems = items ?? (role === "mover" ? MOVER_NAV : CUSTOMER_NAV);
  const pathname = usePathname();

  // Escape 닫기 + 배경 스크롤 락 + 포커스 트랩 — 모달과 같은 useDialog를 쓴다
  // (Notion "Hook 분리 후보 취합"에서 김은진님이 제안하신 항목)
  const { panelRef } = useDialog<HTMLElement>({ open: isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="pc:hidden fixed inset-0 z-[var(--z-gnb)]"
      role="dialog"
      aria-modal="true"
      aria-label={t("menu")}
    >
      <button
        type="button"
        className="bg-black-500/40 absolute inset-0"
        aria-label={t("closeMenu")}
        onClick={onClose}
      />
      <nav
        ref={panelRef}
        tabIndex={-1}
        className={cn("absolute top-0 right-0 flex h-full w-55 flex-col bg-gray-50", className)}
      >
        <div className="border-line-100 flex h-13.5 items-center justify-end border-b px-4 py-2.5">
          <button type="button" aria-label={t("closeMenu")} onClick={onClose} className="size-6">
            <Image src={xMd} alt="" width={24} height={24} className="size-6" />
          </button>
        </div>
        <ul className="flex flex-col">
          {menuItems.map((item) => {
            const isActive = isGnbNavActive(pathname, item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-16 flex w-full items-center overflow-hidden px-5 py-6 font-medium",
                    getGnbNavColorClass(isActive)
                  )}
                >
                  {tNav.has(item.id) ? tNav(item.id) : item.label}
                </Link>
              </li>
            );
          })}
          {footer ? <li>{footer}</li> : null}
          {/* 언어 선택 — PC는 GNB 우측에 있지만 좁은 화면에서는 자리가 없어
              메뉴 안으로 내립니다. 메뉴 항목과 같은 좌우 여백을 씁니다. */}
          <li className="border-line-100 border-t px-5 py-6">
            <LocaleSwitcher size="sm" />
          </li>
        </ul>
      </nav>
    </div>
  );
}
