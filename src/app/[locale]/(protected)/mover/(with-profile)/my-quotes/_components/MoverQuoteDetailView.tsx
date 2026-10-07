"use client";

import { ConfirmedBadge } from "@/components/common/CardParts";
import { useLocale, useTranslations } from "next-intl";
import MoveTypeChip from "@/components/filter/ChipMoveType";
import QuoteShare from "@/components/quote/QuoteShare";
import type { MoverEstimate } from "@/lib/services/mover-estimate-service";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatPrice, formatRequestDate, formatUsageDate, type DateLocale } from "@/lib/utils/date";

const PC_QUERY = "(min-width: 1280px)";

interface MoverQuoteDetailViewProps {
  estimate: MoverEstimate;
  /**
   * 공유 대상 — 기사님 화면은 **본인 상세 페이지**를 공유합니다.
   * 견적서 경로(`/mover/my-quotes/...`)는 기사님 전용이라 받는 사람이 못 엽니다.
   */
  moverId: number;
  /** 공유 문구에 쓰는 본인 별명 */
  moverNickName: string;
}

/**
 * 견적 정보 블록의 한 줄 — 라벨 90px + 값.
 *
 * 피그마(`1:9352`)는 라벨이 x=0 w=90, 값이 x=113이라 사이가 23px입니다.
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    // 라벨 90 + 사이 23 = 값이 113에서 시작합니다 (피그마 라벨 x=0, 값 x=113)
    //
    // 폭은 `w-`(고정)가 아니라 `min-w-`입니다. 한국어 라벨은 90px에 들어가 피그마와
    // 같지만, 일본어 "見積もり依頼日"처럼 더 긴 번역은 90px를 넘겨 두 줄로 접혔습니다.
    <div className="flex items-center gap-5.75">
      <span className="text-16 pc:text-18 text-gray-gray-300 min-w-22.5 shrink-0 font-normal whitespace-nowrap">
        {label}
      </span>
      {/* 모바일만 값이 오른쪽 끝으로 붙습니다 (피그마 `1:9493` w=222 + text-right).
          태블릿·PC는 라벨 바로 뒤에서 시작합니다(`1:9354` 값 폭이 내용만큼). */}
      <span className="text-16 pc:text-18 text-black-black-400 tablet:flex-none tablet:text-left min-w-0 flex-1 text-right font-medium">
        {value}
      </span>
    </div>
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
  const tQuote = useTranslations("quote");
  const tCommon = useTranslations("common");
  const tService = useTranslations("service");
  const locale = useLocale() as DateLocale;
  const isPc = useMediaQuery(PC_QUERY);
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
          {/* 배지 위치가 사이즈마다 다릅니다 — 모바일은 칩과 같은 줄(피그마 `1:9476` x=239),
              태블릿·PC는 이름 줄 오른쪽(`1:9338` x=645). */}
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MoveTypeChip variant={request.category} size="md" />
              {estimate.isTargeted && <MoveTypeChip variant="TARGETED" size="md" />}
            </div>
            {isConfirmed && (
              <span className="tablet:hidden">
                <ConfirmedBadge />
              </span>
            )}
          </div>

          <div className="mt-5 flex w-full items-center justify-between gap-4">
            <p className="text-18 pc:text-24 text-black-300 flex min-w-0 items-center gap-1.5 font-semibold">
              <span className="min-w-0 truncate">{request.userName}</span>
              <span className="shrink-0">{tQuote("customerHonorific")}</span>
            </p>
            {isConfirmed && (
              <span className="tablet:inline-flex hidden">
                <ConfirmedBadge />
              </span>
            )}
          </div>

          <hr className="border-line-100 tablet:mt-6.75 mt-5 w-full border-0 border-t" />

          {/* 견적가 — PC·태블릿은 라벨 뒤에 값이 붙고(피그마 라벨 52, 값 x=113),
              모바일만 값이 오른쪽 끝으로 갑니다(`1:9487` x=238) */}
          <div className="tablet:justify-start tablet:mt-6.75 mt-5 flex items-center justify-between">
            <span className="text-16 pc:text-24 text-black-black-400 tablet:min-w-22.5 shrink-0 font-semibold whitespace-nowrap">
              {tQuote("quotePrice")}
            </span>
            <span className="text-20 pc:text-24 text-black-black-400 tablet:ml-5.75 font-bold">
              {estimate.price === null ? tCommon("noPrice") : formatPrice(estimate.price, locale)}
            </span>
          </div>

          <hr className="border-line-100 tablet:mt-6.75 mt-5 w-full border-0 border-t" />

          <p className="text-16 pc:text-24 text-black-black-400 tablet:mt-7.5 mt-5 font-semibold">
            {tQuote("quoteInfo")}
          </p>

          {/* 행 간격 — 피그마는 행 시작점이 PC·태블릿 42 / 모바일 38입니다.
              행 높이가 PC 26 / 태블릿·모바일 24라 gap은 16 / 18 / 14가 됩니다. */}
          <div className="tablet:gap-4.5 tablet:mt-6 pc:gap-4 mt-5 flex flex-col gap-3">
            <InfoRow label={tQuote("requestDate")} value={formatRequestDate(request.createdAt)} />
            <InfoRow label={tQuote("service")} value={tService(request.category)} />
            <InfoRow
              label={tQuote("usageDate")}
              value={formatUsageDate(request.movingDate, locale)}
            />
            <InfoRow label={tCommon("from")} value={request.fromAddress} />
            <InfoRow label={tCommon("to")} value={request.toAddress} />
          </div>
        </div>

        {/* 공유 — PC는 우측, 태블릿·모바일은 구분선 아래로 내려옵니다 */}
        {/* 태블릿·모바일은 구분선 아래 32px에 공유가 옵니다 (피그마 구분선 521 → 공유 553) */}
        <div className="pc:mt-0 pc:w-56 pc:shrink-0 mt-8 w-full">
          <hr className="border-line-100 pc:hidden mb-8 w-full border-0 border-t" />
          {/* 문구가 사이즈마다 다릅니다 — PC tQuote("shareTitlePc")(`1:9384`),
              태블릿·모바일 tQuote("shareTitleMobile")(`1:9508`). */}
          <QuoteShare
            title={isPc ? tQuote("shareTitlePc") : tQuote("shareTitleMobile")}
            shareUrl={`/movers/${moverId}`}
            variant="mover"
            moverNickName={moverNickName}
            className="pc:items-start"
          />
        </div>
      </div>
    </div>
  );
}
