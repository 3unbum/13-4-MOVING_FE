"use client";

import clsx from "clsx";
import Image from "next/image";
import chevronLeftDefault from "@/assets/icons/chevron-left-md.svg";
import chevronLeftActive from "@/assets/icons/chevron-left-md-active.svg";
import chevronRightDefault from "@/assets/icons/chevron-right-md.svg";
import chevronRightActive from "@/assets/icons/chevron-right-md-active.svg";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 생략 시 pc 브레이크포인트 기준 자동 반응형(모바일·태블릿=sm, PC=lg). 특정 사이즈로 고정할 때만 지정. */
  size?: "sm" | "lg";
  className?: string;
}

// 피그마 디자인 시스템 "Pagination" 컴포넌트 스펙(component/pagination/sm·lg) 그대로 반영
// - 정사각형 버튼(원형 X), sm 34px/rounded-6px · lg 48px/rounded-8px, 배경은 항상 gray-50(#FFFFFF)
// - 현재 페이지는 배경 변화 없이 텍스트만 semibold + black-black-400(#262524)로 강조
// - 다른 페이지 번호는 gray-gray-200(#c4c4c4), 굵기는 사이즈별로 다름(lg medium / sm regular — 피그마 파일 자체 표기)
// - "..." 생략은 텍스트가 아니라 13×3px 바 아이콘, gray-gray-300(#ababab)
// - 이전/다음 버튼은 클릭 가능 여부에 따라 아이콘 자체가 교체됨(default ↔ active), opacity 처리 아님
const SIZE_STYLES = {
  sm: {
    button: "size-[34px] rounded-[6px]",
    gapOuter: "gap-2", // 8px
    text: "text-[16px]",
    inactiveWeight: "font-normal",
  },
  lg: {
    button: "size-[48px] rounded-[8px]",
    gapOuter: "gap-2.5", // 10px
    text: "text-[18px]",
    inactiveWeight: "font-medium",
  },
} as const;

// size 생략 시 기본값: SIZE_STYLES를 pc: 프리픽스로 묶어 반응형으로 자동 전환
const RESPONSIVE_STYLES = {
  button: "size-[34px] rounded-[6px] pc:size-[48px] pc:rounded-[8px]",
  gapOuter: "gap-2 pc:gap-2.5",
  text: "text-[16px] pc:text-[18px]",
  inactiveWeight: "font-normal pc:font-medium",
};

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const siblingCount = 1;
  const totalNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: (number | "ellipsis")[] = [1];

  if (showLeftEllipsis) {
    pages.push("ellipsis");
  } else {
    for (let i = 2; i < leftSiblingIndex; i++) pages.push(i);
  }

  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push("ellipsis");
  } else {
    for (let i = rightSiblingIndex + 1; i < totalPages; i++) pages.push(i);
  }

  pages.push(totalPages);

  return pages;
}

// 사용 예: <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
// 페이지 상태는 호출부에서 관리 — 컴포넌트는 UI + 콜백만 담당
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  size,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageNumbers(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const styles = size ? SIZE_STYLES[size] : RESPONSIVE_STYLES;

  const buttonBase = clsx(
    "flex shrink-0 items-center justify-center bg-gray-50 disabled:cursor-not-allowed",
    styles.button
  );

  return (
    <nav
      aria-label="페이지네이션"
      className={clsx("flex items-center", styles.gapOuter, className)}
    >
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        className={buttonBase}
      >
        <Image
          src={isFirstPage ? chevronLeftDefault : chevronLeftActive}
          alt=""
          className="size-6"
        />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className={buttonBase} aria-hidden="true">
              <span className="bg-gray-gray-300 h-[3px] w-[13px] rounded-full" />
            </span>
          ) : (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={clsx(
                buttonBase,
                "leading-[26px]",
                styles.text,
                page === currentPage
                  ? "text-black-black-400 font-semibold"
                  : clsx(styles.inactiveWeight, "text-gray-gray-200")
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        aria-label="다음 페이지"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className={buttonBase}
      >
        <Image
          src={isLastPage ? chevronRightDefault : chevronRightActive}
          alt=""
          className="size-6"
        />
      </button>
    </nav>
  );
}
