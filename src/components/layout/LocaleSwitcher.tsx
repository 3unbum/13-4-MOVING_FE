"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useTransition } from "react";
import DropdownProfile from "@/components/layout/DropdownProfile";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

interface LocaleSwitcherProps {
  /** 트리거 크기 — GNB가 sm(모바일·태블릿) / md(PC) 두 벌을 씁니다 */
  size?: "sm" | "md";
  className?: string;
}

/**
 * 언어 선택 (한국어 · English · 中文).
 *
 * ⚠️ 피그마에 없는 UI입니다. 다국어가 심화 요구사항이라 시안에 빠져 있어,
 * 기존 `DropdownProfile` 패널을 재사용해 GNB 톤을 맞췄습니다.
 *
 * `@/i18n/navigation`의 `usePathname`은 locale을 **뺀** 경로를 돌려주므로,
 * 같은 화면을 유지한 채 언어만 바꿀 수 있습니다.
 * (`/en/movers`에서 한국어를 고르면 `/movers`로 갑니다)
 */
export default function LocaleSwitcher({ size = "md", className }: LocaleSwitcherProps) {
  const tLocale = useTranslations("locale");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (value: string) => {
    setIsOpen(false);
    if (value === locale) return;
    startTransition(() => {
      // usePathname이 locale을 뺀 **실제** 경로를 주므로(`/movers/73`),
      // 동적 세그먼트도 그대로 유지됩니다.
      router.replace(pathname, { locale: value as Locale });
    });
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={tLocale("label")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        disabled={isPending}
        onClick={() => setIsOpen((value) => !value)}
        className={cn(
          "text-gray-gray-500 hover:text-black-400 flex items-center gap-1 font-medium whitespace-nowrap disabled:opacity-50",
          size === "sm" ? "text-14" : "text-16"
        )}
      >
        {LOCALE_LABELS[locale]}
        <span aria-hidden className="text-10">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="absolute top-full right-0 z-[var(--z-gnb-dropdown)] mt-3">
          <DropdownProfile
            size="sm"
            ariaLabel={`${tLocale("label")} ${tCommon("options")}`}
            value={locale}
            options={routing.locales.map((value) => ({
              value,
              label: LOCALE_LABELS[value],
            }))}
            containerRef={wrapRef}
            onClose={() => setIsOpen(false)}
            onChange={handleSelect}
          />
        </div>
      ) : null}
    </div>
  );
}
