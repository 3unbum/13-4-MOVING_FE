import checkCircleOrange from "@/assets/icons/check-circle-orange-sm.svg";
import clsx from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * "확정견적" 배지. 배경 없이 주황 아이콘 + 텍스트.
 *
 * default 상태에서도 자리를 차지해야 해서(피그마가 opacity-0을 씁니다)
 * 조건부 렌더링 대신 visible prop으로 투명도만 조절합니다. 레이아웃이 흔들리지 않습니다.
 */
export function ConfirmedBadge({ visible = true }: { visible?: boolean }) {
  return (
    <span
      aria-hidden={!visible}
      className={clsx(
        "text-16 flex shrink-0 items-center justify-center gap-1 font-bold text-orange-400",
        !visible && "opacity-0"
      )}
    >
      <Image src={checkCircleOrange} alt="" className="size-5 shrink-0" />
      확정견적
    </span>
  );
}

/** "견적대기" 배지 — 대기중인 내역 카드. 텍스트만 있고 아이콘이 없습니다 */
export function PendingBadge() {
  return (
    <span className="text-16 text-gray-gray-300 shrink-0 px-2 font-semibold whitespace-nowrap">
      견적대기
    </span>
  );
}

/** 카드 우측 상단의 경과 시간 텍스트 — 받은 요청 카드 */
export function ElapsedTime({ children }: { children: ReactNode }) {
  return <span className="text-14 text-gray-gray-500 shrink-0">{children}</span>;
}

/**
 * 카드 하단의 "견적 금액 / 180,000원" 줄.
 * 위쪽 구분선(line-200)까지 포함합니다.
 * 피그마가 높이를 고정하고 내용을 아래로 붙입니다 (lg 52 / sm 47).
 */
export function PriceFooter({ price, size = "sm" }: { price: number; size?: "sm" | "lg" }) {
  const isLg = size === "lg";

  return (
    <div
      className={clsx(
        "border-line-200 flex w-full items-end justify-between border-t",
        isLg ? "h-13" : "h-11.75"
      )}
    >
      <span
        className={clsx(
          "font-medium",
          isLg ? "text-16 text-black-black-450" : "text-14 text-gray-gray-300"
        )}
      >
        견적 금액
      </span>
      <span
        className={clsx(
          "text-black-black-450 font-bold whitespace-nowrap",
          isLg ? "text-24" : "text-18"
        )}
      >
        {price.toLocaleString()}원
      </span>
    </div>
  );
}

/**
 * 견적내역 카드의 금액 줄. 구분선이 없고 오른쪽 정렬이며
 * 라벨/금액 색이 PriceFooter와 다릅니다 (gray-500 / black-400).
 */
export function PriceInline({ price, size = "sm" }: { price: number; size?: "sm" | "lg" }) {
  const isLg = size === "lg";

  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <span className="text-14 text-gray-gray-500 font-medium">견적 금액</span>
      <span className={clsx("text-black-black-400 font-bold", isLg ? "text-24" : "text-18")}>
        {price.toLocaleString()}원
      </span>
    </div>
  );
}

/**
 * 카드 전체를 덮는 딤 레이어. 반려/이사완료 카드에서 씁니다.
 * 카드가 relative라 inset-0으로 덮이고, 하단 버튼이 있으면 children으로 받습니다.
 */
export function CardOverlay({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="border-gray-gray-300 bg-overlay-dim absolute inset-0 flex flex-col items-center justify-center rounded-[20px] border">
      <div className="flex w-50 flex-col items-center gap-5">
        <p className="text-18 font-semibold whitespace-nowrap text-white">{message}</p>
        {children}
      </div>
    </div>
  );
}
