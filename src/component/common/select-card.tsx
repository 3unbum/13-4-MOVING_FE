import checkIcon from "@/assets/icons/check.svg";
import homeImg from "@/assets/images/common/이사유형_가정이사.png";
import officeImg from "@/assets/images/common/이사유형_사무실이사.png";
import smallImg from "@/assets/images/common/이사유형_소형이사.png";
import clsx from "clsx";
import Image, { type StaticImageData } from "next/image";
import type { ButtonHTMLAttributes } from "react";

type SelectCardVariant = "소형이사" | "가정이사" | "사무실이사";
type SelectCardSize = "sm" | "md";

interface SelectCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: SelectCardVariant;
  size?: SelectCardSize;
  selected?: boolean;
}

const IMAGES: Record<SelectCardVariant, StaticImageData> = {
  소형이사: smallImg,
  가정이사: homeImg,
  사무실이사: officeImg,
};

const SUBTITLES: Record<SelectCardVariant, string> = {
  소형이사: "원룸, 투룸, 20평대 미만",
  가정이사: "쓰리룸, 20평대 이상",
  사무실이사: "사무실, 상업공간",
};

// 사용법: <SelectCard variant="소형이사" size="md" selected={selected} onClick={() => setSelected("소형이사")} />
export default function SelectCard({
  variant,
  size = "sm",
  selected = false,
  className,
  ...props
}: SelectCardProps) {
  const isMd = size === "md";

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "relative flex items-start gap-2 rounded-2xl border-2 px-4 py-5 text-left",
        isMd ? "w-64 flex-col items-end gap-4 pb-4" : "w-81.75 justify-end",
        selected
          ? "border-orange-400 bg-orange-100"
          : "bg-background-200 hover:bg-background-300 border-transparent hover:border-gray-300",
        className
      )}
      {...props}
    >
      <div
        className={clsx(
          "flex min-w-0 flex-1 items-start gap-2",
          isMd ? "w-full flex-none flex-row" : "flex-col"
        )}
      >
        <span
          className={clsx(
            "flex size-4.5 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-orange-400 bg-orange-400" : "border-line-200 bg-gray-50"
          )}
        >
          {selected && <Image src={checkIcon} alt="" className="h-auto w-2" />}
        </span>
        <span className="flex flex-col items-start">
          <span
            className={clsx(
              "text-16 font-semibold",
              selected ? "text-orange-400" : "text-black-500"
            )}
          >
            {variant}
          </span>
          <span
            className={clsx(
              "text-14 whitespace-nowrap",
              selected ? "text-orange-400" : "text-gray-gray-500"
            )}
          >
            {SUBTITLES[variant]}
          </span>
        </span>
      </div>
      <div className="size-30 shrink-0">
        <Image src={IMAGES[variant]} alt="" />
      </div>
    </button>
  );
}
