"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { formatMovingDate, type DateLocale } from "@/lib/utils/date";
import type { HTMLAttributes } from "react";
import { SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";
import { shortenAddress } from "@/lib/utils/address";

type SubHeaderSize = "sm" | "md" | "lg";

interface SubHeaderProps extends HTMLAttributes<HTMLDivElement> {
  category: ServiceCode;
  createdAt: string;
  fromAddress: string;
  toAddress: string;
  movingDate: string;
  size?: SubHeaderSize;
}

function Field({
  label,
  value,
  big,
  className,
}: {
  label: string;
  value: string;
  big: boolean;
  className?: string;
}) {
  return (
    <div className={cn(big ? "flex flex-col" : "flex justify-between", className)}>
      <p className="text-14 text-gray-gray-500 font-normal">{label}</p>
      <p className={cn("text-14 text-black-500 font-semibold", big && "text-18")}>{value}</p>
    </div>
  );
}

export default function SubHeader({
  category,
  createdAt,
  fromAddress,
  toAddress,
  movingDate,
  size = "sm",
  className,
  ...props
}: SubHeaderProps) {
  const t = useTranslations("common");
  const tService = useTranslations("service");
  const locale = useLocale() as DateLocale;
  const isLg = size === "lg";
  const isMd = size === "md";
  const big = isMd || isLg;

  return (
    <section
      className={cn(
        "flex flex-col gap-5 px-6 py-6",
        isMd && "px-18 py-8",
        isLg && "flex flex-row justify-between py-8 pr-100 pl-80",
        className
      )}
      {...props}
    >
      <header className={cn("flex flex-col", big && "gap-1")}>
        <p className={cn("text-black-500 font-bold", big ? "text-24" : "text-20")}>
          {/* SERVICE_LABELS는 BE가 쓰는 한글 원문이라 표시용으로는 번역을 씁니다
              (상수는 ServiceCode 타입과 폴백용으로 남깁니다) */}
          {tService.has(category) ? tService(category) : SERVICE_LABELS[category]}
        </p>
        <p
          className={cn(
            big ? "text-14 text-gray-gray-500 font-normal" : "text-gray-gray-500 text-12"
          )}
        >
          {t("requestedAt")}: {formatMovingDate(createdAt, locale)}
        </p>
      </header>
      <div className={cn(big ? "flex flex-row items-end" : "flex flex-col")}>
        <Field label={t("from")} value={shortenAddress(fromAddress)} big={big} />
        <span className={cn(big ? "px-3 pb-0.5" : "hidden")} aria-hidden>
          {" → "}
        </span>
        <Field label={t("to")} value={shortenAddress(toAddress)} big={big} />
        <Field
          label={t("movingDate")}
          value={formatMovingDate(movingDate, locale)}
          big={big}
          className={big ? "pl-10" : undefined}
        />
      </div>
    </section>
  );
}
