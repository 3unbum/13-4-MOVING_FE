"use client";

import { useState } from "react";
import { CardEstimateHistory } from "@/components/quote/CardEstimate";
import QuoteEmptyState from "@/components/quote/QuoteEmptyState";
import Sort from "@/components/common/Sort";
import { SERVICE_LABELS } from "@/components/filter/ChipRegion";
import { cn } from "@/lib/utils/cn";
import type { Estimate } from "@/lib/services/estimate-service";
import type { QuotationRequest } from "@/lib/services/quotation-request-service";

/** 요청 1건 + 거기 달린 견적들 = 화면의 블록 하나 */
export interface PastQuoteBlock {
  request: QuotationRequest;
  estimates: Estimate[];
}

interface PastQuotesPanelProps {
  blocks: PastQuoteBlock[];
  onDetailClick?: (estimateId: number) => void;
}

/**
 * 확정된 견적으로 볼 상태.
 *
 * 이사일이 지나면 배치(`expireRequests.job.ts`)가 확정 견적을 CONFIRMED → COMPLETED로
 * 바꿉니다. CONFIRMED만 보면 이미 이사를 마친 건의 확정 견적을 놓칩니다.
 */
function isConfirmedEstimate(estimate: Estimate) {
  return estimate.estimateStatus === "CONFIRMED" || estimate.estimateStatus === "COMPLETED";
}

const FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "confirmed", label: "확정견적" },
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKst(iso: string) {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS);
}

/** "24. 06. 24." — 요청 카드 우측 상단의 신청일 표기 */
function formatShortDate(iso: string) {
  const kst = toKst(iso);
  const yy = String(kst.getUTCFullYear()).slice(2);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${yy}. ${mm}. ${dd}.`;
}

/** "2026년 07월 01일 (월)" — 이용일 표기 */
function formatFullDate(iso: string) {
  const kst = toKst(iso);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  return `${kst.getUTCFullYear()}년 ${mm}월 ${dd}일 (${WEEKDAYS[kst.getUTCDay()]})`;
}

/** 좌측 "견적 정보" 블록의 라벨+값 한 줄 */
/**
 * 좌측 "견적 정보" 블록의 라벨+값 한 줄.
 *
 * 라벨이 주황(`#f9502e`)인 게 견적 상세와 다릅니다 — 피그마 `1:11670` 계열.
 * 값은 오른쪽 끝 정렬이고, 모바일만 14px입니다(`1:11519` h24 / `1:11668` h26).
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-14 tablet:text-16 shrink-0 font-semibold text-orange-400">{label}</span>
      <span className="text-14 text-black-500 tablet:text-16 text-right font-semibold">
        {value}
      </span>
    </div>
  );
}

/**
 * 견적서 한 장 — size만 다른 두 벌을 CSS로 전환합니다 (JS 미디어쿼리는 첫 렌더에 깜빡임).
 *
 * 카드 자체가 상세 진입점입니다. `CardEstimateHistory`에는 버튼이 없어서(피그마 `1:11657`)
 * 카드 전체를 클릭 영역으로 씁니다 — 피그마에 "견적 상세_확정 견적"과
 * "견적 상세_확정하지 않은 견적" 화면이 따로 있는데, 둘 다 여기서만 도달할 수 있습니다.
 */
function EstimateRow({ estimate, onClick }: { estimate: Estimate; onClick: () => void }) {
  const common = {
    category: estimate.quotationRequest.category,
    isTargeted: estimate.isTargeted,
    // 카드 제목은 기사님 한 줄 소개입니다
    title: estimate.mover.bio,
    // REJECTED(반려)면 null — 카드가 "견적가 없음"으로 표기합니다
    price: estimate.price,
    isConfirmed: isConfirmedEstimate(estimate),
    nickName: estimate.mover.nickName,
    profileImage: estimate.mover.image,
    rating: estimate.mover.avgRating,
    reviewCount: estimate.mover.reviewCount,
    career: estimate.mover.career,
    confirmedCount: estimate.mover.confirmedCount,
    favoriteCount: estimate.mover.favoriteCount,
  };

  return (
    // 카드 안에 버튼이 없어 <button>으로 감싸도 중첩 문제가 없습니다.
    // 기본 버튼 스타일(가운데 정렬 등)을 지우려고 text-left·w-full을 둡니다.
    <button
      type="button"
      onClick={onClick}
      aria-label={`${estimate.mover.nickName} 기사님의 견적 상세 보기`}
      className="w-full cursor-pointer text-left"
    >
      <div className="tablet:hidden">
        <CardEstimateHistory size="sm" {...common} />
      </div>
      <div className="tablet:block hidden">
        <CardEstimateHistory size="lg" {...common} />
      </div>
    </button>
  );
}

/**
 * 받았던 견적 탭 (피그마 1:11657 / 1:11434 / 1:11510).
 *
 * 대기 중인 견적과 달리 요청 1건이 블록 하나가 되고, 그 안에 견적 목록이 들어갑니다.
 * PC·태블릿은 좌(견적 정보)/우(견적서 목록) 2단, 모바일은 세로 1단입니다.
 */
export default function PastQuotesPanel({ blocks, onDetailClick }: PastQuotesPanelProps) {
  // 필터는 요청 블록마다 독립이라 id별로 들고 있습니다
  const [filters, setFilters] = useState<Record<number, string>>({});

  if (blocks.length === 0) {
    return <QuoteEmptyState message={"아직 받았던 견적이 없어요."} />;
  }

  return (
    // 모바일은 블록이 화면 전체 폭을 쓰고 8px 회색 바로 나뉩니다(피그마 `1:11550`).
    // 태블릿·PC는 흰 카드입니다.
    <div className="tablet:gap-8 tablet:px-9 tablet:py-8 pc:gap-10 pc:px-10 pc:py-10 flex flex-1 flex-col items-center gap-2 bg-gray-50 py-0">
      {blocks.map(({ request, estimates: allEstimates }) => {
        const filter = filters[request.id] ?? "all";
        const estimates =
          filter === "confirmed" ? allEstimates.filter(isConfirmedEstimate) : allEstimates;

        return (
          <section
            key={request.id}
            className={cn(
              "flex w-full flex-col bg-white",
              // 모바일: 전체 폭, 좌우 24 (`1:11516`)
              "gap-8 px-6 py-8",
              // 태블릿: 600 카드, 패딩 28 (`1:11365`)
              "tablet:max-w-150 tablet:gap-8 tablet:rounded-[20px] tablet:px-7 tablet:py-8",
              "tablet:shadow-[inset_0_0_0_0.5px_var(--color-line-100),2px_2px_10px_0_rgba(220,220,220,0.2)]",
              // PC: 1120 카드, 패딩 40, 좌우 2단 (`1:11662`)
              "pc:max-w-280 pc:flex-row pc:gap-15 pc:px-10 pc:py-11"
            )}
          >
            {/* 좌측(모바일·태블릿은 상단) — 견적 정보 */}
            <div className="pc:w-65 flex shrink-0 flex-col gap-10.5">
              <div className="flex flex-col gap-5">
                {/* 모바일은 제목이 가운데, 날짜는 목록 아래에 있습니다 (`1:11517`·`1:11537`) */}
                <div className="tablet:flex-row tablet:items-baseline tablet:justify-between flex flex-col">
                  <h3 className="text-16 text-black-black-450 tablet:text-20 tablet:text-left text-center font-semibold">
                    견적 정보
                  </h3>
                  <span className="text-14 text-gray-gray-300 tablet:block hidden font-normal">
                    {formatShortDate(request.createdAt)}
                  </span>
                </div>

                {/* 모바일·태블릿만 행 사이에 구분선이 있습니다 (`1:11523`·`1:11532`) */}
                <div className="tablet:gap-3 flex flex-col gap-2">
                  <InfoRow label="이사 유형" value={SERVICE_LABELS[request.category]} />
                  <hr className="border-line-200 pc:hidden" />
                  <InfoRow label="출발지" value={request.fromAddress} />
                  <InfoRow label="도착지" value={request.toAddress} />
                  <hr className="border-line-200 pc:hidden" />
                  <InfoRow label="이용일" value={formatFullDate(request.movingDate)} />
                </div>
              </div>

              <span className="text-14 text-gray-gray-300 tablet:hidden font-normal">
                {formatShortDate(request.createdAt)}
              </span>
            </div>

            {/* PC만 좌우를 가르는 세로 구분선 (피그마 `1:11684`).
                피그마 Line은 폭 0이라 자리를 차지하지 않습니다 — border로 넣으면
                1px이 우측 폭에서 빠지므로(660 → 659) 음수 마진으로 상쇄합니다. */}
            <div className="border-line-200 pc:block -mr-px hidden shrink-0 border-l" />

            {/* 우측(모바일·태블릿은 하단) — 견적서 목록 */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="flex items-center gap-2">
                <h3 className="text-16 text-black-black-450 tablet:text-20 font-semibold">
                  견적서 목록
                </h3>
                <span className="text-16 tablet:text-20 font-semibold text-orange-400">
                  {allEstimates.length}
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {/* 피그마 Dropdown — 모바일·태블릿 75×36(lg) / PC 160×50(xl) */}
                <div className="pc:hidden">
                  <Sort
                    size="lg"
                    options={FILTER_OPTIONS}
                    value={filter}
                    onChange={(value) => setFilters((prev) => ({ ...prev, [request.id]: value }))}
                  />
                </div>
                <div className="pc:block hidden">
                  <Sort
                    size="xl"
                    options={FILTER_OPTIONS}
                    value={filter}
                    onChange={(value) => setFilters((prev) => ({ ...prev, [request.id]: value }))}
                  />
                </div>

                <div className="divide-line-100 flex flex-col divide-y">
                  {estimates.map((estimate) => (
                    <EstimateRow
                      key={estimate.id}
                      estimate={estimate}
                      onClick={() => onDetailClick?.(estimate.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
