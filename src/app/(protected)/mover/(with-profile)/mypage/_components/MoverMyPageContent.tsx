import Chip, {
  REGION_LABELS,
  SERVICE_LABELS,
  type RegionCode,
} from "@/components/filter/ChipRegion";
import MoverReviewSection from "@/components/review/MoverReviewSection";
import type { MoverListItem } from "@/lib/services/mover-service";
import { toServiceCode } from "@/lib/utils/mover-list-mapper";
import ActivityStats from "./ActivityStats";
import { EditBasicInfoButton, EditMoverProfileButton } from "./MoverProfileEditButtons";
import ProfileHeader from "./ProfileHeader";

/** 목록 API가 코드·한글 라벨을 혼용하는 것과 같은 사정이라 지역도 방어적으로 정규화한다 */
function regionLabel(value: string): string {
  if (value in REGION_LABELS) return REGION_LABELS[value as RegionCode];
  const found = Object.entries(REGION_LABELS).find(([, korean]) => korean === value);
  return found?.[1] ?? value;
}

interface MoverMyPageContentProps {
  mover: MoverListItem;
  moverId: number;
}

// (main)/movers/[moverId](공개 상세)와 같은 데이터 모양(MoverListItem)을 자기 자신의 id로 조회해서 쓴다.
export default function MoverMyPageContent({ mover, moverId }: MoverMyPageContentProps) {
  const categories = [...new Set(mover.services.map(toServiceCode))];

  return (
    <section className="tablet:px-18 tablet:py-10 pc:mx-auto pc:w-300 pc:px-0 pc:py-12 flex w-full flex-1 flex-col px-5 py-8">
      <div className="pc:flex-row pc:items-start pc:justify-between flex flex-col gap-10">
        <div className="tablet:gap-10 flex min-w-0 flex-1 flex-col gap-6">
          {/* 이 묶음(프로필+구분선+활동현황)만 태블릿부터 32px, 그 아래 섹션들과는 40px 간격 */}
          <div className="tablet:gap-8 flex flex-col gap-6">
            <ProfileHeader mover={mover} />

            <div className="bg-line-100 h-px w-full" />

            <ActivityStats
              confirmedCount={mover.confirmedCount}
              avgRating={mover.avgRating}
              career={mover.career}
            />
          </div>

          <div className="tablet:gap-4 flex flex-col gap-2">
            <h2 className="text-16 tablet:text-20 text-black-black-400 font-semibold">
              제공 서비스
            </h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((code) => (
                <Chip
                  key={code}
                  size="md"
                  selected
                  className="text-14 tablet:px-5 tablet:py-2.5 tablet:text-18 px-3 py-1.5"
                >
                  {SERVICE_LABELS[code]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="tablet:gap-4 flex flex-col gap-2">
            <h2 className="text-16 tablet:text-20 text-black-black-400 font-semibold">
              서비스 가능 지역
            </h2>
            <div className="flex flex-wrap gap-3">
              {mover.regions.map((region) => (
                <Chip
                  key={region}
                  size="md"
                  // 지역 칩(비선택)은 웨이트가 브레이크포인트마다 달라짐 — 모바일 Medium, 태블릿·PC Regular
                  className="text-14 tablet:px-5 tablet:py-2.5 tablet:text-18 tablet:font-normal px-3 py-1.5 font-medium"
                >
                  {regionLabel(region)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="bg-line-100 h-px w-full" />

          <MoverReviewSection moverId={moverId} />
        </div>

        {/* PC 전용 우측 버튼 컬럼. 폭 283px 고정(피그마 데스크탑 기준) */}
        <div className="pc:flex hidden w-70.75 shrink-0 flex-col gap-4">
          <EditMoverProfileButton />
          <EditBasicInfoButton />
        </div>
      </div>
    </section>
  );
}
