"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import arrowUpIcon from "@/assets/icons/arrow-up-md.svg";
import { useScrollToTopVisible } from "@/hooks/useScrollToTopVisible";
import { cn } from "@/lib/utils/cn";

interface ScrollToTopButtonProps {
  className?: string;
}

/**
 * 뷰포트 1배 이상 스크롤 시 우하단에 노출되는 맨 위로 가기 버튼.
 *
 * 숨길 때 언마운트하지 않고 opacity만 내립니다. 언마운트하면 사라지는 트랜지션을
 * 탈 DOM이 없어 툭 꺼집니다. 대신 숨은 동안은 포커스·클릭이 닿지 않게 막습니다.
 */
export default function ScrollToTopButton({ className }: ScrollToTopButtonProps) {
  const t = useTranslations("common");
  const visible = useScrollToTopVisible();

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-label={t("scrollToTop")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={scrollToTop}
      className={cn(
        // 채팅 FAB(75px·right 16px) 바로 위, 세로 중심축을 맞춥니다: 16 + (75 - 54) / 2
        "fixed right-[26.5px] bottom-28 z-[var(--z-sticky)]",
        "flex size-13.5 items-center justify-center rounded-2xl bg-orange-400 shadow-md",
        "transition-opacity duration-200",
        "focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none",
        visible ? "opacity-100 hover:opacity-90" : "pointer-events-none opacity-0",
        className
      )}
    >
      <Image src={arrowUpIcon} alt="" width={24} height={24} className="size-6" />
    </button>
  );
}
