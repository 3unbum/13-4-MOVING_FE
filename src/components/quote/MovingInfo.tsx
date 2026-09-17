import arrowRight from "@/assets/icons/arrow-right-long.svg";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import type { HTMLAttributes } from "react";

type MovingInfoSize = "sm" | "lg";
/**
 * 카드와 모달이 같은 정보를 다르게 그립니다.
 *
 * - `card`(기본): 라벨 위 / 값 아래, 값은 16 semibold. lg는 이사일이 오른쪽 끝(`justify-between`)
 * - `modal`: 라벨과 값이 **가로**로 붙고, PC는 이사일이 도착지 오른쪽 48px(`1:10684`),
 *   모바일은 값이 14 medium에 아랫줄로 내려갑니다(`1:10738`)
 */
type MovingInfoVariant = "card" | "modal";

interface MovingInfoProps extends HTMLAttributes<HTMLDivElement> {
  from: string;
  to: string;
  /** 표시용으로 이미 포맷된 문자열 (예: "2024년 07월 01일 (월)") */
  movingDate: string;
  size?: MovingInfoSize;
  variant?: MovingInfoVariant;
}

/** 라벨(회색) + 값(진한색) 한 쌍 */
function InfoItem({
  label,
  value,
  variant,
  isLg,
}: {
  label: string;
  value: string;
  variant: MovingInfoVariant;
  isLg: boolean;
}) {
  // 라벨과 값이 한 줄에 붙는 건 모바일 모달뿐입니다 (피그마 `1:10738` gap 8).
  // PC 모달(`1:10684` / `1:11274`)은 카드와 똑같이 라벨 위 / 값 아래입니다.
  const isInline = variant === "modal" && !isLg;
  const isModal = variant === "modal";

  return (
    // 주소는 길이가 가변이라 넘칠 때만 잘라냅니다.
    // 기본은 내용 크기(피그마 값)를 유지하고, min-w-0으로 넘칠 때만 축소되게 합니다
    <div
      className={cn(
        "flex min-w-0",
        isInline ? "items-center gap-2" : "flex-col items-start justify-center"
      )}
    >
      <span className="text-14 text-gray-gray-500 shrink-0">{label}</span>
      <span
        className={cn(
          "text-black-500 max-w-full truncate",
          // 카드는 16 semibold, 모달은 PC 16 / 모바일 14에 medium
          isModal ? (isLg ? "text-16 font-medium" : "text-14 font-medium") : "text-16 font-semibold"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// 사용법: <MovingInfo from="서울시 중구" to="경기도 수원시" movingDate="2024년 07월 01일 (월)" size="lg" />
export default function MovingInfo({
  from,
  to,
  movingDate,
  size = "sm",
  variant = "card",
  className,
  ...props
}: MovingInfoProps) {
  const isLg = size === "lg";
  const isModal = variant === "modal";
  const item = { variant, isLg };

  return (
    <div
      className={cn(
        "flex w-full items-start",
        // 모달 PC는 이사일이 도착지 바로 오른쪽 48px (카드처럼 끝으로 밀지 않습니다)
        isModal
          ? isLg
            ? "gap-12"
            : "flex-col gap-2"
          : isLg
            ? "justify-between"
            : "flex-col gap-3",
        className
      )}
      {...props}
    >
      {/* lg 201px는 기본 문구에 딱 맞는 값이라 최소폭으로 둡니다 — 주소가 길면 늘어나고, 그래도 모자라면 잘립니다 */}
      <div
        className={cn(
          "flex gap-3",
          // 모바일 모달만 라벨·값이 한 줄이라 가운데 정렬, 나머지는 값 기준 아래 맞춤
          isModal && !isLg ? "items-center" : "items-end",
          // 모달 PC는 내용만큼만 차지하고 이사일이 48px 옆에 붙습니다 (피그마 201은 기본
          // 문구 기준 값이라, 실제 주소가 길면 잘리지 않고 늘어나는 쪽이 맞습니다)
          isModal && isLg ? "shrink-0" : isLg ? "min-w-50.25" : "w-full min-w-0"
        )}
      >
        <InfoItem label="출발지" value={from} {...item} />
        <Image src={arrowRight} alt="에서" className="h-5.75 w-4.5 shrink-0" />
        <InfoItem label="도착지" value={to} {...item} />
      </div>
      {/* sm은 세로 배치라 부모 폭을 직접 제한해야 잘립니다 */}
      <div className={cn("flex min-w-0", isLg ? "shrink-0" : "w-full")}>
        <InfoItem label="이사일" value={movingDate} {...item} />
      </div>
    </div>
  );
}
