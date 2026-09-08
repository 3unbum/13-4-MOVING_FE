import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChipSize = "sm" | "md";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ChipSize;
  selected?: boolean;
}

// 사용법: <Chip size="md" selected={selected} onClick={() => setSelected(!selected)}>서울</Chip>
export default function Chip({
  children,
  size = "sm",
  selected = false,
  className,
  ...props
}: ChipProps) {
  const isMd = size === "md";
  const weightClass = selected || !isMd ? "font-medium" : "font-normal";

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "self-start rounded-full border whitespace-nowrap",
        isMd ? "text-18 px-5 py-2.5" : "text-14 px-3 py-1.5",
        weightClass,
        selected
          ? "border-orange-400 bg-orange-100 text-orange-400"
          : "bg-background-background-100 text-black-black-400 border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
