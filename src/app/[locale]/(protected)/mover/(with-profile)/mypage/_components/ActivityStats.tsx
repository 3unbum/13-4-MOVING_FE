// 부모(mypage/page.tsx)가 "use client"라 이미 클라이언트 번들에 있었습니다.
// 번역 훅을 쓰려고 지시어만 명시합니다 — 렌더 방식은 바뀌지 않습니다.
"use client";

import { useTranslations } from "next-intl";

interface ActivityStatsProps {
  confirmedCount: number;
  avgRating: number;
  career: number;
}

// 좌우 패딩(40→160px)·높이(105→120px)가 태블릿부터 커지는 건 오타가 아니라 피그마 스펙 그대로다.
export default function ActivityStats({ confirmedCount, avgRating, career }: ActivityStatsProps) {
  const t = useTranslations("moverPage");
  const tMover = useTranslations("mover");
  const tCommon = useTranslations("common");
  return (
    <div className="tablet:gap-4 flex flex-col gap-2">
      <h2 className="text-16 tablet:text-20 text-black-black-400 font-semibold">
        {t("activityStats")}
      </h2>
      <div className="bg-background-background-100 border-line-100 tablet:px-40 tablet:h-30 flex h-26.25 items-center justify-between rounded-2xl border px-10">
        <div className="tablet:gap-1 flex w-14 flex-col items-center">
          <span className="text-14 tablet:text-16 text-black-300">{tMover("statProgress")}</span>
          <span className="text-18 tablet:text-20 font-bold text-orange-400">
            {tCommon("confirmedCount", { count: confirmedCount })}
          </span>
        </div>
        <div className="tablet:gap-1 flex w-26 flex-col items-center">
          <span className="text-14 tablet:text-16 text-black-300">{tMover("statReview")}</span>
          <span className="text-18 tablet:text-20 font-bold text-orange-400">
            {avgRating.toFixed(1)}
          </span>
        </div>
        <div className="tablet:gap-1 flex w-11.5 flex-col items-center">
          <span className="text-14 tablet:text-16 text-black-300">{tMover("statCareer")}</span>
          <span className="text-18 tablet:text-20 font-bold text-orange-400">
            {tCommon("careerYears", { years: career })}
          </span>
        </div>
      </div>
    </div>
  );
}
