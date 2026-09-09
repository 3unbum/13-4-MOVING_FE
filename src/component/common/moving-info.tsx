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
    // 주소는 길이가 가변이라 넘칠 때만 잘라냅니다.
    // 기본은 내용 크기(피그마 값)를 유지하고, min-w-0으로 넘칠 때만 축소되게 합니다
    <div className="flex min-w-0 flex-col items-start justify-center">
      <span className="text-14 text-gray-gray-500">{label}</span>
      <span className="text-16 text-black-500 max-w-full truncate font-semibold">{value}</span>
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
      {/* lg 201px는 기본 문구에 딱 맞는 값이라 최소폭으로 둡니다 — 주소가 길면 늘어나고, 그래도 모자라면 잘립니다 */}
      <div className={clsx("flex items-end gap-3", isLg ? "min-w-50.25" : "w-full min-w-0")}>
        <InfoItem label="출발지" value={from} />
        <Image src={arrowRight} alt="에서" className="h-5.75 w-4.5 shrink-0" />
        <InfoItem label="도착지" value={to} />
      </div>
      {/* sm은 세로 배치라 부모 폭을 직접 제한해야 잘립니다 */}
      <div className={clsx("flex min-w-0", isLg ? "shrink-0" : "w-full")}>
        <InfoItem label="이사일" value={movingDate} />
      </div>
    </div>
  );
}
