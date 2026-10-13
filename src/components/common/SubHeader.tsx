"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { formatMovingDate, type DateLocale } from "@/lib/utils/date";
import type { HTMLAttributes } from "react";
import { SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";
import { shortenAddress } from "@/lib/utils/address";
import { localizeShortAddress } from "@/lib/utils/district";

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
    // min-w-0 — flex 자식은 기본이 min-width:auto 라 내용보다 작아지지 않습니다.
    // 이게 없으면 아래 truncate 가 안 걸리고 칸이 그대로 밀려 넘칩니다.
    <div className={cn(big ? "flex min-w-0 flex-col" : "flex justify-between", className)}>
      <p className="text-14 text-gray-gray-500 font-normal">{label}</p>
      {/* 하이픈(“Namdong-gu”)을 브라우저가 줄바꿈 지점으로 봐서 "Namdong-" / "gu" 로
          끊겼습니다. 지역명은 한 덩어리라 하이픈에서 자르지 않습니다.
          폭이 모자라면 줄바꿈 대신 줄임표로 처리합니다 — 셋이 한 줄에 놓이는 레이아웃이라
          한 칸이 두 줄이 되면 나머지 칸의 세로 정렬(items-end)까지 틀어집니다. */}
      <p className={cn("text-14 text-black-500 truncate font-semibold", big && "text-18")}>
        {value}
      </p>
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
  const tRegion = useTranslations("region");
  const locale = useLocale() as DateLocale;
  const isLg = size === "lg";
  const isMd = size === "md";
  const big = isMd || isLg;

  /**
   * 요약 자리의 지역 표기 — "Seoul Gangnam-gu" / "大邱 中区".
   *
   * 한국어는 지금처럼 주소를 축약해 "서울 강남구"를 씁니다.
   *
   * 다른 언어는 주소가 한글이라 읽을 수 없어 두 조각을 각각 번역해 잇습니다.
   * 시/도는 `region` enum 이고, 그 아래 시·군·구는 표(`translateDistrict`)를 씁니다.
   * 시/도만 보여주면 같은 시 안에서 이사할 때 "대구 → 대구"가 되어 출발지와 도착지가
   * 구분되지 않습니다.
   *
   * 전체 주소(동·호수까지)는 견적 상세에서 한국어 원문으로 봅니다 — 기사님께 전달하거나
   * 복사해서 쓰는 값이라 번역하면 오히려 쓸 수 없습니다.
   */
  const place = (address: string) =>
    // 기사님 화면(MoverRequestList·MoverEstimateList)과 같은 함수를 씁니다 —
    // 따로 구현하면 "표에 없을 때 원문 유지" 같은 규칙이 한쪽에만 반영됩니다.
    localizeShortAddress(shortenAddress(address), locale, tRegion);

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
      {/* lg 는 헤더와 좌우로 나뉘는데(justify-between), 이 블록이 줄어들 수 있어야
          넓은 화면에서도 안쪽 칸이 제 폭을 받습니다. min-w-0 이 없으면 내용 기준으로
          고정돼 긴 영문 지역명이 잘립니다. */}
      <div
        className={cn(big ? "flex flex-row items-end" : "flex flex-col", isLg && "min-w-0 shrink")}
      >
        {/* 내용만큼 쓰되 폭이 모자랄 때만 줄어듭니다(min-w-0 이 있어야 줄어듭니다).
            flex-1 로 균등 분배하면 짧은 한국어에서 칸이 떠 보입니다. */}
        <Field
          label={t("from")}
          value={place(fromAddress)}
          big={big}
          className={big ? "min-w-0 shrink" : undefined}
        />
        <span className={cn(big ? "shrink-0 px-3 pb-0.5" : "hidden")} aria-hidden>
          {" → "}
        </span>
        <Field
          label={t("to")}
          value={place(toAddress)}
          big={big}
          className={big ? "min-w-0 shrink" : undefined}
        />
        {/* 이사일은 길이가 일정하고 잘리면 날짜를 못 읽으니 줄어들지 않게 둡니다.
            폭이 모자랄 때 양보하는 쪽은 출발지·도착지입니다.
            왼쪽 여백은 태블릿에서 절반으로 — 피그마 40px 은 PC(1280~) 기준이고,
            744 에서는 그만큼이 지역명 몫을 가져갑니다. */}
        <Field
          label={t("movingDate")}
          value={formatMovingDate(movingDate, locale)}
          big={big}
          className={big ? "pc:pl-10 shrink-0 pl-5" : undefined}
        />
      </div>
    </section>
  );
}
