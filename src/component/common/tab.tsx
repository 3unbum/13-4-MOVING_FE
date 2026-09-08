import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  // 현재 선택된 탭인지 — 하단 인디케이터(border)와 텍스트 색상/굵기가 바뀜
  active?: boolean;
}

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
        "text-14 flex h-[54px] flex-1 shrink-0 items-center justify-center border-b-2 border-solid whitespace-nowrap",
        "pc:h-auto pc:flex-none pc:py-4 pc:text-20",
        active
          ? "border-black-400 text-black-500 pc:font-semibold font-bold"
          : "border-transparent font-semibold text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
