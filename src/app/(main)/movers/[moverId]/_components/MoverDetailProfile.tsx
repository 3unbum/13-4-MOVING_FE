"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { FavoriteCount } from "@/components/common/CardParts";
import Chip, { REGION_LABELS, type RegionCode } from "@/components/filter/ChipRegion";
import MoveTypeChip from "@/components/filter/ChipMoveType";
import MoverName from "@/components/mover/MoverName";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import starActive from "@/assets/icons/star-sm-active.svg";
import type { MoverDetail } from "@/lib/services/mover-service";
import { toServiceCode } from "@/lib/utils/mover-list-mapper";
import { cn } from "@/lib/utils/cn";

type MoverDetailProfileProps = {
  mover: MoverDetail;
  favoriteCount: number;
  isFavorited: boolean;
};

function isRegionCode(value: string): value is RegionCode {
  return value in REGION_LABELS;
}

/** 지역 칩 라벨 — 한글이면 그대로, enum이면 한글로 */
function toRegionLabel(value: string): string {
  if (isRegionCode(value)) {
    return REGION_LABELS[value];
  }
  return value;
}

/** 프로필 상단 + 통계 + 서비스/지역 — Figma 1:5268 수치 */
export default function MoverDetailProfile({
  mover,
  favoriteCount,
  isFavorited,
}: MoverDetailProfileProps) {
  const categories = mover.services.map(toServiceCode);

  return (
    <section className="flex w-full flex-col gap-10">
      {/* 소개 블록 ↔ 통계 31px ≈ gap-[31px] */}
      <div className="flex w-full flex-col gap-[31px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => (
                <span key={category}>
                  <MoveTypeChip variant={category} size="sm" className="tablet:hidden" />
                  <MoveTypeChip
                    variant={category}
                    size="md"
                    className="tablet:inline-flex hidden"
                  />
                </span>
              ))}
            </div>
            {/* PC 24 / Tablet·Mobile 16~20 */}
            <h1
              className={cn(
                "text-black-300 font-semibold",
                "text-16 leading-6.5",
                "tablet:text-20 tablet:leading-8",
                "pc:text-24 pc:leading-8"
              )}
            >
              {mover.bio}
            </h1>
          </div>

          <div className="flex w-full items-center justify-between gap-2">
            {/* PC 18 SemiBold — xl은 bold라 semibold로 덮음 */}
            <MoverName
              nickName={mover.nickName}
              size="xl"
              className="tablet:[&>span]:text-16 pc:[&>span]:text-18 [&>span]:font-semibold!"
            />
            <FavoriteCount
              count={favoriteCount}
              isFavorited={isFavorited}
              countFirst
              className="gap-1"
              countClassName="text-14 tablet:text-16 pc:text-18 text-gray-gray-500 font-medium leading-6.5"
            />
          </div>

          <p
            className={cn(
              "text-gray-gray-500 w-full whitespace-pre-wrap",
              "text-14 leading-6",
              "tablet:text-16 tablet:leading-6.5"
            )}
          >
            {mover.description}
          </p>
        </div>

        {/* 통계 — 흰 배경 / line-200 / PC px-100 h-120 */}
        <div
          className={cn(
            "border-line-200 flex w-full items-center justify-between rounded-2xl border bg-white",
            "h-[95px] px-10",
            "tablet:h-30 tablet:px-25"
          )}
        >
          <StatBlock label="진행" value={`${mover.confirmedCount}건`} />
          <StatBlock
            label="리뷰"
            value={
              <span className="flex items-center gap-1.5">
                <Image src={starActive} alt="" className="tablet:size-6 size-5 shrink-0" />
                <span>{mover.avgRating.toFixed(1)}</span>
                <span className="text-gray-gray-300 text-14 tablet:text-16 font-medium">
                  ({mover.reviewCount})
                </span>
              </span>
            }
          />
          <StatBlock label="총 경력" value={`${mover.career}년`} />
        </div>
      </div>

      <ChipGroup title="제공 서비스">
        {mover.services.map((service) => (
          <span key={service} className="contents">
            <Chip size="sm" selected disabled className="tablet:hidden pointer-events-none">
              {service}
            </Chip>
            <Chip
              size="md"
              selected
              disabled
              className="tablet:inline-flex pointer-events-none hidden"
            >
              {service}
            </Chip>
          </span>
        ))}
      </ChipGroup>

      {/* 지역은 Figma unselected(회색 아웃라인) */}
      <ChipGroup title="서비스 가능 지역">
        {mover.regions.map((region) => (
          <span key={region} className="contents">
            <Chip size="sm" disabled className="tablet:hidden pointer-events-none">
              {toRegionLabel(region)}
            </Chip>
            <Chip size="md" disabled className="tablet:inline-flex pointer-events-none hidden">
              {toRegionLabel(region)}
            </Chip>
          </span>
        ))}
      </ChipGroup>
    </section>
  );
}

function StatBlock({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="text-black-300 flex flex-col items-center gap-1 text-center">
      <span className="text-14 tablet:text-16 leading-6.5 font-normal">{label}</span>
      <span className="text-16 tablet:text-20 leading-6.5 font-bold">{value}</span>
    </div>
  );
}

function ChipGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-16 tablet:text-20 text-black-black-400 leading-8 font-semibold">
        {title}
      </h2>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

/** 프로필 아바타 — 로그인 프레임 기준. Mobile 64 / Tablet 100 / PC 134, radius 12 */
export function MoverDetailAvatar({ image, nickName }: { image: string | null; nickName: string }) {
  return (
    <div
      className={cn(
        "relative z-10",
        "-mt-10.5 ml-5",
        "tablet:-mt-[77px] tablet:ml-18",
        "pc:-mt-[103px] pc:ml-[359px]"
      )}
    >
      <ProfileAvatar src={image} alt={nickName} size="64" className="tablet:hidden" />
      <ProfileAvatar
        src={image}
        alt={nickName}
        size="100"
        className="tablet:block pc:hidden hidden"
      />
      <ProfileAvatar src={image} alt={nickName} size="134" className="pc:block hidden" />
    </div>
  );
}
