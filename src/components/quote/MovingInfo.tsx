"use client";

import arrowRight from "@/assets/icons/arrow-right-long.svg";
import { useTranslations } from "next-intl";
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
  /**
   * 출발지·도착지를 숨기고 이사일만 보여줍니다.
   *
   * 견적 보내기 모달은 바로 아래에 전체 주소(동·호수까지)를 따로 두는데,
   * 여기까지 "충남 천안시 → 경기 안산시"를 내면 같은 정보가 두 번 나와
   * 모달 높이만 늘어납니다.
   */
  hideAddresses?: boolean;
}

/** 라벨(회색) + 값(진한색) 한 쌍 */
function InfoItem({
  label,
  value,
  variant,
  isLg,
  className,
}: {
  label: string;
  value: string;
  variant: MovingInfoVariant;
  isLg: boolean;
  className?: string;
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
        isInline ? "items-center gap-2" : "flex-col items-start justify-center",
        className
      )}
    >
      <span className="text-14 text-gray-gray-500 shrink-0">{label}</span>
      {/* 넘칠 때는 줄임표로 자릅니다. 지역명을 끝까지 보여주려고 nowrap 을 걸어봤지만,
          카드가 2열인 사이즈에서는 주소 둘이 쓸 폭이 모자라 글자가 이사일·화살표와
          맞닿거나("Chuncheon-s10/18/2026") 카드 밖으로 삐져나갔습니다.
          조금 잘리더라도 레이아웃이 유지되는 쪽이 읽기 낫습니다. */}
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
  hideAddresses = false,
  className,
  ...props
}: MovingInfoProps) {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
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
            ? // gap-3 — 주소가 길어지면 이사일과 맞닿습니다. justify-between 만으로는
              // 둘이 붙는 순간 "Chuncheon...10/18/2026" 처럼 읽히지 않습니다.
              "justify-between gap-3"
            : "flex-col gap-3",
        className
      )}
      {...props}
    >
      {/* #216 의 hideAddresses(견적 보내기 모달은 아래에 전체 주소를 따로 둬서 요약을
          숨깁니다)와 폭 배분을 함께 둡니다. */}
      {!hideAddresses && (
        <div
          className={cn(
            "flex gap-3",
            // 모바일 모달만 라벨·값이 한 줄이라 가운데 정렬, 나머지는 값 기준 아래 맞춤
            isModal && !isLg ? "items-center" : "items-end",
            // 주소 묶음은 남는 폭을 받되(flex-1) 모자라면 줄어듭니다(min-w-0).
            // `shrink-0`로 두면 행 폭을 넘겨 이사일을 밀어내고, min-w 를 고정하면
            // 안쪽 truncate 가 안 걸립니다 — 부모가 안 줄어들기 때문입니다.
            // 피그마 201px 최소폭은 한국어 기준이라 영문에는 걸지 않습니다.
            isLg ? "min-w-0 flex-1" : "w-full min-w-0"
          )}
        >
          {/* 출발지·도착지가 폭을 반씩 나눕니다. 이게 없으면 각자 내용 크기대로 배치돼
              긴 쪽만 먼저 잘립니다 — "Gangwon Chunc..."로 시·군·구가 사라집니다. */}
          <InfoItem label={tCommon("from")} value={from} {...item} className="flex-1" />
          <Image src={arrowRight} alt={t("arrowAlt")} className="h-5.75 w-4.5 shrink-0" />
          <InfoItem label={tCommon("to")} value={to} {...item} className="flex-1" />
        </div>
      )}
      {/* sm은 세로 배치라 부모 폭을 직접 제한해야 잘립니다 */}
      <div className={cn("flex min-w-0", isLg ? "shrink-0" : "w-full")}>
        <InfoItem label={tCommon("movingDate")} value={movingDate} {...item} />
      </div>
    </div>
  );
}
