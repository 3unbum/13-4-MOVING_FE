import clsx from "clsx";
import Image from "next/image";
import type { ButtonHTMLAttributes } from "react";
import filterIconActive from "@/assets/icons/filter-active.svg";
import filterIconDefault from "@/assets/icons/filter-default.svg";

interface FilterButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-pressed"
> {
  // 필터가 적용된 상태인지 — true면 주황 강조 스타일로 전환 (토글 버튼이라 aria-pressed로 상태 전달)
  active?: boolean;
}

export default function FilterButton({
  active = false,
  className,
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: FilterButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      aria-label={ariaLabel ?? "필터"}
      className={clsx(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border p-1 transition-colors",
        active
          ? "border-orange-400 bg-orange-100"
          : "not-disabled:hover:bg-background-200 border-gray-500 bg-gray-50 shadow-[4px_4px_5px_0px_rgba(238,238,238,0.1)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <Image src={active ? filterIconActive : filterIconDefault} alt="" className="size-6" />
    </button>
  );
}
