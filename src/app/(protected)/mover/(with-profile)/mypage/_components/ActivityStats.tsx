interface ActivityStatsProps {
  confirmedCount: number;
  avgRating: number;
  career: number;
}

// 좌우 패딩(40→160px)·높이(105→120px)가 태블릿부터 커지는 건 오타가 아니라 피그마 스펙 그대로다.
export default function ActivityStats({ confirmedCount, avgRating, career }: ActivityStatsProps) {
  return (
    <div className="tablet:gap-4 flex flex-col gap-2">
      <h2 className="text-16 tablet:text-20 text-black-black-400 font-semibold">활동 현황</h2>
      <div className="bg-background-background-100 border-line-100 tablet:px-40 tablet:h-30 flex h-26.25 items-center justify-between rounded-2xl border px-10">
        <div className="tablet:gap-1 flex w-14 flex-col items-center">
          <span className="text-14 tablet:text-16 text-black-300">진행</span>
          <span className="text-18 tablet:text-20 font-bold text-orange-400">
            {confirmedCount}건
          </span>
        </div>
        <div className="tablet:gap-1 flex w-26 flex-col items-center">
          <span className="text-14 tablet:text-16 text-black-300">리뷰</span>
          <span className="text-18 tablet:text-20 font-bold text-orange-400">
            {avgRating.toFixed(1)}
          </span>
        </div>
        <div className="tablet:gap-1 flex w-11.5 flex-col items-center">
          <span className="text-14 tablet:text-16 text-black-300">총 경력</span>
          <span className="text-18 tablet:text-20 font-bold text-orange-400">{career}년</span>
        </div>
      </div>
    </div>
  );
}
