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
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-14 text-gray-gray-500 shrink-0 font-normal">{label}</span>
      <span className="text-14 text-black-500 text-right font-medium">{value}</span>
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
    // REJECTED(반려)면 price가 null입니다
    price: estimate.price ?? 0,
    isConfirmed: estimate.estimateStatus === "CONFIRMED",
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
    <div className="bg-background-background-100 tablet:gap-8 tablet:px-18 tablet:py-10 pc:gap-10 pc:px-10 pc:py-12 flex flex-1 flex-col items-center gap-6 px-6 py-8">
      {blocks.map(({ request, estimates: allEstimates }) => {
        const filter = filters[request.id] ?? "all";
        const estimates =
          filter === "confirmed"
            ? allEstimates.filter((e) => e.estimateStatus === "CONFIRMED")
            : allEstimates;

        return (
          <section
            key={request.id}
            className={cn(
              "flex w-full max-w-81.75 flex-col gap-6 rounded-[20px] bg-white",
              "shadow-[inset_0_0_0_0.5px_var(--color-line-100),2px_2px_10px_0_rgba(220,220,220,0.2)]",
              "tablet:max-w-150 tablet:px-8 tablet:py-8 pc:max-w-285 pc:flex-row pc:gap-12 pc:px-10 pc:py-10 px-5 py-6"
            )}
          >
            {/* 좌측(모바일은 상단) — 견적 정보 */}
            <div className="pc:w-58 flex shrink-0 flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-16 text-black-500 tablet:text-18 font-semibold">견적 정보</h3>
                <span className="text-12 text-gray-gray-400 tablet:text-14 font-normal">
                  {formatShortDate(request.createdAt)}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <InfoRow label="이사 유형" value={SERVICE_LABELS[request.category]} />
                <InfoRow label="출발지" value={request.fromAddress} />
                <InfoRow label="도착지" value={request.toAddress} />
                <InfoRow label="이용일" value={formatFullDate(request.movingDate)} />
              </div>
            </div>

            {/* 우측(모바일은 하단) — 견적서 목록 */}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-16 text-black-500 tablet:text-18 font-semibold">견적서 목록</h3>
                <span className="text-16 tablet:text-18 font-semibold text-orange-400">
                  {allEstimates.length}
                </span>
              </div>

              <div className="w-27">
                <Sort
                  size="sm"
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
          </section>
        );
      })}
    </div>
  );
}
