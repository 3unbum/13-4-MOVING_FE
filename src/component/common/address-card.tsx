import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import AddressChip from "@/component/common/chip-address";

type AddressCardSize = "sm" | "md";

interface AddressCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  zipCode: string;
  roadAddress: string;
  lotAddress: string;
  size?: AddressCardSize;
  selected?: boolean;
}

// 주소 검색 결과 카드 (도로명/지번)
export default function AddressCard({
  zipCode,
  roadAddress,
  lotAddress,
  size = "md",
  selected = false,
  className,
  ...props
}: AddressCardProps) {
  const isMd = size === "md";

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "shadow-address-card flex w-full flex-col items-start gap-4 rounded-2xl border px-4 pt-5 pb-6 text-left transition-colors",
        selected ? "border-orange-500 bg-orange-100" : "border-line-100 bg-gray-50",
        className
      )}
      {...props}
    >
      <p className={clsx("text-black-black-400 font-semibold", isMd ? "text-16" : "text-14")}>
        {zipCode}
      </p>
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center gap-2">
          <AddressChip size={isMd ? "md" : "sm"}>도로명</AddressChip>
          <p className={clsx("text-black-black-400 min-w-0 flex-1", isMd ? "text-16" : "text-14")}>
            {roadAddress}
          </p>
        </div>
        <div className="flex w-full items-center gap-2">
          <AddressChip size={isMd ? "md" : "sm"}>지번</AddressChip>
          <p className={clsx("text-black-black-400 min-w-0 flex-1", isMd ? "text-16" : "text-14")}>
            {lotAddress}
          </p>
        </div>
      </div>
    </button>
  );
}
