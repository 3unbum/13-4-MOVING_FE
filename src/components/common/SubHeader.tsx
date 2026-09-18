import { cn } from "@/lib/utils/cn";
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

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function formatDate(iso: string) {
  const kst = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${kst.getUTCFullYear()}년 ${mm}월 ${dd}일 (${WEEKDAYS[kst.getUTCDay()]})`;
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
          {SERVICE_LABELS[category]}
        </p>
        <p
          className={cn(
            big ? "text-14 text-gray-gray-500 font-normal" : "text-gray-gray-500 text-12"
          )}
        >
          견적 신청일: {formatDate(createdAt)}
        </p>
      </header>
      <div className={cn(big ? "flex flex-row items-end" : "flex flex-col")}>
        <Field label="출발지" value={shortenAddress(fromAddress)} big={big} />
        <span className={cn(big ? "px-3 pb-0.5" : "hidden")} aria-hidden>
          {" → "}
        </span>
        <Field label="도착지" value={shortenAddress(toAddress)} big={big} />
        <Field
          label="이사일"
          value={formatDate(movingDate)}
          big={big}
          className={big ? "pl-10" : undefined}
        />
      </div>
    </section>
  );
}
