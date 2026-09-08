import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type AddressChipSize = "sm" | "md";

interface AddressChipProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  size?: AddressChipSize;
}

// 사용법: <AddressChip size="sm">도로명</AddressChip>
export default function AddressChip({
  children,
  size = "sm",
  className,
  ...props
}: AddressChipProps) {
  const isMd = size === "md";

  return (
    <span
      className={clsx(
        "inline-flex items-center self-start rounded-full bg-orange-100 py-0.5 font-semibold text-orange-400",
        isMd ? "text-14 w-13.5 justify-center px-1" : "text-12 px-1.5",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
