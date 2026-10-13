"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Sort from "@/components/common/Sort";
import PayAction from "@/components/quote/PayAction";
import PayDetailToggle from "@/components/quote/PayDetailToggle";
import { EstimateRow } from "@/components/quote/PastQuotesPanel";
import QuoteEmptyState from "@/components/quote/QuoteEmptyState";
import CardEstimateSkeleton from "@/components/skeleton/CardEstimateSkeleton";
import SkeletonStatus from "@/components/skeleton/SkeletonStatus";
import { useFavoritedMovers } from "@/hooks/useFavoriteMover";
import { usePayQuotes } from "@/hooks/usePayment";
import {
  formatMonthLabel,
  formatMovingDate,
  recentMonths,
  type DateLocale,
} from "@/lib/utils/date";
import type { PaymentStageFilter, PaySort } from "@/lib/services/estimate-service";

interface PayQuotesPanelProps {
  /** DUE = 대기 중인 결제(선수금 + 잔금) / PAID = 결제 내역 */
  stage: PaymentStageFilter;
  onDetailClick?: (estimateId: number) => void;
}

/**
 * 목록 영역 — 받았던 견적(`PastQuotesPanel`)의 요청 블록과 같은 틀입니다.
 *
 * 모바일은 화면 전체 폭(좌우 24), 태블릿 이상은 600 흰 카드입니다. 바깥 여백에 따로
 * 패딩을 더하면 카드 안쪽 폭이 줄어 작은 화면에서 카드가 삐져나가므로, 패딩은 이 안쪽에만 둡니다.
 */
const LIST_CLASS =
  "flex w-full flex-col divide-y divide-line-100 bg-white px-6 py-3 " +
  "tablet:max-w-150 tablet:rounded-[20px] tablet:px-7 " +
  "tablet:shadow-[inset_0_0_0_0.5px_var(--color-line-100),2px_2px_10px_0_rgba(220,220,220,0.2)]";

/**
 * 정렬·월별 드롭다운 그림자 — Sort의 기본 그림자보다 진하게 덮어씁니다.
 * Sort의 className은 바깥 래퍼에 붙어서, 안쪽 버튼을 선택자로 지정해야 그림자가 버튼 모양을 따릅니다.
 */
const SORT_SHADOW = "[&>button]:shadow-[4px_4px_5px_0_rgba(170,170,170,0.35)]";

const WRAPPER_CLASS = "tablet:px-9 tablet:py-8 flex flex-1 flex-col items-center bg-gray-50";

/** 조회 실패 — 카드 대신 이유를 보여줍니다 */
function PayError() {
  const t = useTranslations("quote");

  return (
    <div className="bg-background-background-100 text-14 text-gray-gray-400 flex flex-1 items-center justify-center px-6 py-20">
      {t("loadFailed")}
    </div>
  );
}

/** 첫 로딩 — 카드 3장 자리 */
function PayLoading() {
  const t = useTranslations("common");

  return (
    <SkeletonStatus label={t("loading")} className={WRAPPER_CLASS}>
      <div className={LIST_CLASS}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="py-5">
            <div className="tablet:hidden">
              <CardEstimateSkeleton size="sm" variant="history" />
            </div>
            <div className="tablet:block hidden">
              <CardEstimateSkeleton size="lg" variant="history" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonStatus>
  );
}

/**
 * 결제 탭 — "대기 중인 결제"와 "결제 내역".
 *
 * 대기 중인 결제에는 선수금 대기(확정 후)와 잔금 대기(이사 완료 후)가 함께 나옵니다.
 * 피그마에 결제 화면이 없어서 받았던 견적의 카드(`CardEstimateHistory`)를 그대로 쓰고,
 * 대기 중인 결제에만 결제 버튼을 붙입니다. 결제 내역은 카드 위에 결제일을 보여줍니다.
 *
 * 목록은 무한 스크롤입니다. 맨 아래 sentinel이 보이면 다음 페이지를 받습니다.
 */
export default function PayQuotesPanel({ stage, onDetailClick }: PayQuotesPanelProps) {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const locale = useLocale() as DateLocale;
  // 정렬·월별 조회는 결제 내역에만 둡니다 — 카드 위 결제일 기준입니다. month가 ""이면 전체
  const [sort, setSort] = useState<PaySort>("latest");
  const [month, setMonth] = useState("");
  const { estimates, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    usePayQuotes(stage, sort, month || undefined);
  const { isFavorited } = useFavoritedMovers();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isDue = stage === "DUE";

  // 목록 끝이 보이면 다음 페이지 요청. 새 페이지가 붙었는데도 sentinel이 여전히 화면 안이면
  // estimates가 바뀌며 observer가 다시 만들어져 바로 다음 페이지를 이어서 부릅니다.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchNextPage();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [estimates.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 월별 조회 선택지 — 이번 달부터 거꾸로 12개월. 그보다 오래된 건 "전체"에서 봅니다
  const monthOptions = [
    { value: "", label: t("payMonthAll") },
    ...recentMonths(12).map((value) => ({ value, label: formatMonthLabel(value, locale) })),
  ];

  // 정렬·월을 바꾸면 목록을 새로 받는 동안 스켈레톤이 나오는데, 그동안에도 선택은 남겨 둡니다
  const controls = isDue ? null : (
    <div className="tablet:max-w-150 flex w-full flex-wrap justify-end gap-2 px-6 pb-3">
      <Sort
        size="md"
        className={SORT_SHADOW}
        label={t("payMonthLabel")}
        options={monthOptions}
        value={month}
        onChange={setMonth}
      />
      <Sort
        size="md"
        className={SORT_SHADOW}
        label={t("paySortLabel")}
        options={[
          { value: "latest", label: t("paySortLatest") },
          { value: "oldest", label: t("paySortOldest") },
        ]}
        value={sort}
        onChange={(value) => setSort(value as PaySort)}
      />
    </div>
  );

  if (error) return <PayError />;
  if (isLoading)
    return (
      <div className="flex flex-1 flex-col items-center bg-gray-50 pt-4">
        {controls}
        <PayLoading />
      </div>
    );
  if (estimates.length === 0) {
    return (
      <>
        {/* 월을 골랐는데 비면 다시 바꿀 수 있어야 합니다 */}
        {month ? (
          <div className="flex flex-col items-center bg-gray-50 pt-4">{controls}</div>
        ) : null}
        <QuoteEmptyState message={isDue ? t("emptyPayPending") : t("emptyPayHistory")} />
      </>
    );
  }

  return (
    <div className={WRAPPER_CLASS}>
      {controls}
      <ul className={LIST_CLASS}>
        {estimates.map((estimate) => (
          <li key={estimate.id} className="flex flex-col gap-4 py-5">
            {/* 결제 내역은 결제일이 카드 위에 옵니다 */}
            {!isDue && estimate.paidAt && (
              <p className="text-14 font-semibold text-orange-400">
                {t("paidAt")} {formatMovingDate(estimate.paidAt, locale, false)}
              </p>
            )}

            <EstimateRow
              estimate={estimate}
              isFavorited={isFavorited(estimate.mover.id)}
              onClick={() => onDetailClick?.(estimate.id)}
            />

            {/* 금액 내역과 추가 금액의 사유 — 라벨을 누르면 펼쳐집니다 */}
            <PayDetailToggle estimate={estimate} />

            {isDue && <PayAction estimate={estimate} />}
          </li>
        ))}
      </ul>

      {/* 무한 스크롤 감지 지점 + 다음 페이지 로딩 표시 */}
      <div ref={sentinelRef} className="text-14 text-gray-gray-400 py-6 text-center">
        {isFetchingNextPage ? tCommon("loading") : null}
      </div>
    </div>
  );
}
