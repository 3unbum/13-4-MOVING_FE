import solidBoxMd from "@/assets/icons/solid-box-md.svg";
import solidBoxSm from "@/assets/icons/solid-box-sm.svg";
import solidCompanyMd from "@/assets/icons/solid-company-md.svg";
import solidCompanySm from "@/assets/icons/solid-company-sm.svg";
import solidDocumentMd from "@/assets/icons/solid-document-md.svg";
import solidDocumentSm from "@/assets/icons/solid-document-sm.svg";
import solidHomeMd from "@/assets/icons/solid-home-md.svg";
import solidHomeSm from "@/assets/icons/solid-home-sm.svg";
import clsx from "clsx";
import Image from "next/image";
import type { HTMLAttributes } from "react";

type MoveTypeChipVariant = "소형이사" | "사무실이사" | "가정이사" | "지정견적요청";
type MoveTypeChipSize = "sm" | "md";

interface MoveTypeChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant: MoveTypeChipVariant;
  size?: MoveTypeChipSize;
}

const ICONS: Record<MoveTypeChipVariant, Record<MoveTypeChipSize, string>> = {
  소형이사: { sm: solidBoxSm, md: solidBoxMd },
  사무실이사: { sm: solidCompanySm, md: solidCompanyMd },
  가정이사: { sm: solidHomeSm, md: solidHomeMd },
  지정견적요청: { sm: solidDocumentSm, md: solidDocumentMd },
};

const LABELS: Record<MoveTypeChipVariant, string> = {
  소형이사: "소형이사",
  사무실이사: "사무실이사",
  가정이사: "가정이사",
  지정견적요청: "지정 견적 요청",
};

// 사용법: <MoveTypeChip variant="소형이사" size="md" />
export default function MoveTypeChip({
  variant,
  size = "sm",
  className,
  ...props
}: MoveTypeChipProps) {
  const isMd = size === "md";
  const isRequested = variant === "지정견적요청";

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center self-start pr-1.75",
        isMd ? "gap-1 rounded-md py-1 pl-1.25" : "gap-0.5 rounded py-0.5 pl-1",
        isMd ? "text-14" : "text-13",
        "font-semibold",
        isRequested ? "bg-red-100 text-red-200" : "bg-orange-100 text-orange-400",
        className
      )}
      {...props}
    >
      <Image src={ICONS[variant][size]} alt="" className="size-5 shrink-0" />
      {LABELS[variant]}
    </span>
  );
}
