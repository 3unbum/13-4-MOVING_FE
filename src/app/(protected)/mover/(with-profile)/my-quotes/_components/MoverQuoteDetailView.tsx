"use client";

import MoveTypeChip from "@/components/filter/ChipMoveType";
import QuoteShare from "@/components/quote/QuoteShare";
import type { MoverEstimate } from "@/lib/services/mover-estimate-service";
import { SERVICE_LABELS } from "@/components/filter/ChipRegion";
import { formatRequestDate, formatUsageDate } from "@/lib/utils/date";

interface MoverQuoteDetailViewProps {
  estimate: MoverEstimate;
  /** 공유 문구·링크에 쓰는 본인 정보 — 공유 대상은 기사님 상세 페이지입니다 */
  moverId: number;
  moverNickName: string;
}

/**
 * 견적 정보 블록의 한 줄 — 라벨 90px 고정 + 값.
 *
 * 피그마(`1:9352`)는 라벨이 x=0 w=90, 값이 x=113이라 사이가 23px입니다.
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    // 라벨 90 + 사이 23 = 값이 113에서 시작합니다 (피그마 라벨 x=0, 값 x=113)
    <div className="flex items-start gap-5.75">
      <span className="text-14 pc:text-18 text-gray-gray-400 w-22.5 shrink-0 font-normal">
        {label}
      </span>
      <span className="text-14 pc:text-18 text-black-black-400 min-w-0 font-medium">{value}</span>
    </div>
  );
}

/** 확정견적 배지 — 피그마 `1:9338` (아이콘 + "확정견적") */
function ConfirmedBadge() {
  return (
    <span className="text-16 flex shrink-0 items-center gap-1 font-bold text-orange-400">
      <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
        <circle cx="10" cy="10" r="10" fill="currentColor" />
        <path
          d="M5.5 10.5l3 3 6-6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      확정견적
    </span>
  );
}

/**
 * 견적 상세 (페이지 16 하위, 기사님).
 *
 * 피그마 `1:9323`(PC) / `1:9389`(태블릿) / `1:9452`(모바일).
 * 고객 화면(`QuoteDetailView`)과 달리 확정·찜 버튼이 없고, 보낸 견적을 읽기만 합니다.
 *
 * PC는 본문(741)과 공유(224)가 가로로 나뉘고, 태블릿·모바일은 공유가 아래로 내려갑니다.
 */
export default function MoverQuoteDetailView({
  estimate,
  moverId,
  moverNickName,
}: MoverQuoteDetailViewProps) {
  const { quotationRequest: request } = estimate;
  const isConfirmed =
    estimate.estimateStatus === "CONFIRMED" || estimate.estimateStatus === "COMPLETED";

  return (
    <div className="tablet:px-18 pc:px-10 flex w-full flex-col items-center px-5">
      {/* PC는 본문 741 + 사이 139 + 공유 224 = 1104가 1200 안에 들어갑니다 (피그마 x=360/1240) */}
      {/* 히어로 아래 여백 — 피그마 모바일 35 / 태블릿 46 / PC 43 */}
      <div className="tablet:pt-11.5 pc:max-w-300 pc:flex-row pc:items-start pc:gap-34.75 pc:pt-10.75 flex w-full max-w-150 flex-col pt-8.75 pb-10">
        {/* 본문 — 피그마 PC 741 */}
        <div className="pc:max-w-185.25 flex w-full min-w-0 flex-col">
          <div className="flex items-center gap-3">
            <MoveTypeChip variant={request.category} size="md" />
            {estimate.isTargeted && <MoveTypeChip variant="TARGETED" size="md" />}
          </div>

          <div className="mt-5 flex w-full items-center justify-between gap-4">
            <p className="text-18 pc:text-24 text-black-black-400 flex min-w-0 items-center gap-2 font-semibold">
              <span className="min-w-0 truncate">{request.userName}</span>
              <span className="shrink-0">고객님</span>
            </p>
            {isConfirmed && <ConfirmedBadge />}
          </div>

          <hr className="border-line-100 mt-6.75 w-full border-0 border-t" />

          {/* 견적가 — PC·태블릿은 라벨 뒤에 값이 붙고(피그마 라벨 52, 값 x=113),
              모바일만 값이 오른쪽 끝으로 갑니다(`1:9487` x=238) */}
          <div className="tablet:justify-start mt-6.75 flex items-center justify-between">
            <span className="text-16 pc:text-24 text-black-black-400 tablet:w-22.5 shrink-0 font-semibold">
              견적가
            </span>
            <span className="text-18 pc:text-24 text-black-black-400 tablet:ml-5.75 font-bold">
              {estimate.price === null
                ? "견적가 없음"
                : `${estimate.price.toLocaleString("ko-KR")}원`}
            </span>
          </div>

          <hr className="border-line-100 mt-6.75 w-full border-0 border-t" />

          <p className="text-16 pc:text-24 text-black-black-400 mt-7.5 font-semibold">견적 정보</p>

          {/* 행 간격 — 피그마는 행 시작점이 PC·태블릿 42 / 모바일 38입니다.
              행 높이가 PC 26 / 태블릿·모바일 24라 gap은 16 / 18 / 14가 됩니다. */}
          <div className="tablet:gap-4.5 pc:gap-4 mt-6 flex flex-col gap-3.5">
            <InfoRow label="견적 요청일" value={formatRequestDate(request.createdAt)} />
            <InfoRow label="서비스" value={SERVICE_LABELS[request.category]} />
            <InfoRow label="이용일" value={formatUsageDate(request.movingDate)} />
            <InfoRow label="출발지" value={request.fromAddress} />
            <InfoRow label="도착지" value={request.toAddress} />
          </div>
        </div>

        {/* 공유 — PC는 우측, 태블릿·모바일은 구분선 아래로 내려옵니다 */}
        {/* 태블릿·모바일은 구분선 아래 32px에 공유가 옵니다 (피그마 구분선 521 → 공유 553) */}
        <div className="pc:mt-0 pc:w-56 pc:shrink-0 mt-8 w-full">
          <hr className="border-line-100 pc:hidden mb-8 w-full border-0 border-t" />
          <QuoteShare
            title="견적서 공유하기"
            moverId={moverId}
            moverNickName={moverNickName}
            className="pc:items-start"
          />
        </div>
      </div>
    </div>
  );
}
