import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  // 현재 선택된 탭인지 — 하단 인디케이터(border)와 텍스트 색상/굵기/크기가 바뀜
  active?: boolean;
}

// 폭은 텍스트 길이만큼만 차지 (flex-1로 늘리지 않음) — 여러 개를 나열할 때
// 부모(TabList)의 gap으로 간격을 맞춤. 반응형: 모바일·태블릿은 동일, PC(pc:)만 다름
// - 모바일/태블릿: h-[54px], text-14, active → border-black-400 + font-bold
// - PC: 높이 자동(py-4), text-20, active여도 font-semibold(bold 아님) + border-black-500
export default function Tab({
  children,
  active = false,
  className,
  type = "button",
  ...props
}: TabProps) {
  return (
    <button
      type={type}
      role="tab"
      aria-selected={active}
      className={clsx(
        "text-14 flex h-[54px] shrink-0 items-center border-b-2 border-solid whitespace-nowrap",
        "pc:h-auto pc:py-4 pc:text-20",
        active
          ? "border-black-400 text-black-500 pc:border-black-500 pc:font-semibold font-bold"
          : "border-transparent font-semibold text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
