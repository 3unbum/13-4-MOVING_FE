import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";

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

function shortenAddress(address: string) {
  const tokens = address.trim().split(/\s+/);
  const isProvince = tokens[0]?.endsWith("도");
  const city = isProvince ? tokens[0] : tokens[0]?.replace(/(특별시|광역시)/, "시");
  return tokens[1] ? `${city} ${tokens[1]}` : (city ?? "");
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
    <div className={clsx(big ? "flex flex-col" : "flex justify-between", className)}>
      <p className="text-14 text-gray-gray-500 font-normal">{label}</p>
      <p className={clsx("text-14 text-black-500 font-semibold", big && "text-18")}>{value}</p>
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
      className={clsx(
        "flex flex-col gap-5 px-6 py-6",
        isMd && "px-18 py-8",
        isLg && "flex flex-row justify-between py-8 pr-100 pl-80",
        className
      )}
      {...props}
    >
      <header className={clsx("flex flex-col", big && "gap-1")}>
        <p className={clsx("text-black-500 font-bold", big ? "text-24" : "text-20")}>
          {SERVICE_LABELS[category]}
        </p>
        <p
          className={clsx(
            big ? "text-14 text-gray-gray-500 font-normal" : "text-gray-gray-500 text-12"
          )}
        >
          견적 신청일: {formatDate(createdAt)}
        </p>
      </header>
      <div className={clsx(big ? "flex flex-row items-end" : "flex flex-col")}>
        <Field label="출발지" value={shortenAddress(fromAddress)} big={big} />
        <span className={clsx(big ? "px-3 pb-0.5" : "hidden")} aria-hidden>
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
