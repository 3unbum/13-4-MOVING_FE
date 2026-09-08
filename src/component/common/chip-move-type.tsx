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
import type { ServiceCode } from "./chip-region";

// TARGETED는 BE ServiceType이 아니라 FE에서 판단하는 지정견적요청 표시 — isTargeted는 응답 필드가 아니라 요청 목록 조회용 쿼리 파라미터라 category enum에 못 낌
type MoveTypeChipVariant = ServiceCode | "TARGETED";
type MoveTypeChipSize = "sm" | "md";

interface MoveTypeChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant: MoveTypeChipVariant;
  size?: MoveTypeChipSize;
}

const BG_CLASS: Record<MoveTypeChipVariant, string> = {
  SMALL: "bg-orange-100",
  HOME: "bg-orange-100",
  OFFICE: "bg-red-100",
  TARGETED: "bg-red-100",
};

const ICONS: Record<MoveTypeChipVariant, Record<MoveTypeChipSize, string>> = {
  SMALL: { sm: solidBoxSm, md: solidBoxMd },
  OFFICE: { sm: solidCompanySm, md: solidCompanyMd },
  HOME: { sm: solidHomeSm, md: solidHomeMd },
  TARGETED: { sm: solidDocumentSm, md: solidDocumentMd },
};

const LABELS: Record<MoveTypeChipVariant, string> = {
  SMALL: "소형이사",
  OFFICE: "사무실이사",
  HOME: "가정이사",
  TARGETED: "지정 견적 요청",
};

// 사용법: <MoveTypeChip variant="SMALL" size="md" />
export default function MoveTypeChip({
  variant,
  size = "sm",
  className,
  ...props
}: MoveTypeChipProps) {
  const isMd = size === "md";
  const isRequested = variant === "TARGETED";

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center self-start pr-1.75",
        isMd ? "gap-1 rounded-md py-1 pl-1.25" : "gap-0.5 rounded py-0.5 pl-1",
        isMd ? "text-14" : "text-13",
        "font-semibold",
        BG_CLASS[variant],
        isRequested ? "text-red-200" : "text-orange-400",
        className
      )}
      {...props}
    >
      <Image src={ICONS[variant][size]} alt="" className="size-5 shrink-0" />
      {LABELS[variant]}
    </span>
  );
}
