import arrowRight from "@/assets/icons/arrow-right-long.svg";
import clsx from "clsx";
import Image from "next/image";
import type { HTMLAttributes } from "react";

type MovingInfoSize = "sm" | "lg";

interface MovingInfoProps extends HTMLAttributes<HTMLDivElement> {
  from: string;
  to: string;
  /** 표시용으로 이미 포맷된 문자열 (예: "2024년 07월 01일 (월)") */
  movingDate: string;
  size?: MovingInfoSize;
}

/** 라벨(회색) + 값(진한색) 한 쌍 */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start justify-center">
      <span className="text-14 text-gray-gray-500">{label}</span>
      <span className="text-16 text-black-500 font-semibold whitespace-nowrap">{value}</span>
    </div>
  );
}

// 사용법: <MovingInfo from="서울시 중구" to="경기도 수원시" movingDate="2024년 07월 01일 (월)" size="lg" />
export default function MovingInfo({
  from,
  to,
  movingDate,
  size = "sm",
  className,
  ...props
}: MovingInfoProps) {
  const isLg = size === "lg";

  return (
    <div
      className={clsx(
        "flex w-full items-start",
        isLg ? "justify-between" : "flex-col gap-3",
        className
      )}
      {...props}
    >
      <div className="flex w-50.25 items-end gap-3">
        <InfoItem label="출발지" value={from} />
        <Image src={arrowRight} alt="에서" className="h-5.75 w-4.5 shrink-0" />
        <InfoItem label="도착지" value={to} />
      </div>
      <InfoItem label="이사일" value={movingDate} />
    </div>
  );
}
