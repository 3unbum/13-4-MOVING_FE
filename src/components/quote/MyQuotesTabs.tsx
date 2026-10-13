"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SkeletonBone from "@/components/common/SkeletonBone";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";
import PastQuotesPanel from "@/components/quote/PastQuotesPanel";
import PayQuotesPanel from "@/components/quote/PayQuotesPanel";
import PendingQuotesPanel from "@/components/quote/PendingQuotesPanel";
import CardEstimateSkeleton from "@/components/skeleton/CardEstimateSkeleton";
import SkeletonStatus from "@/components/skeleton/SkeletonStatus";
import { usePastQuotes, usePendingQuotes } from "@/hooks/useMyQuotes";

export type QuoteTab = "pending" | "past" | "payPending" | "payHistory";

/** 조회 실패 시 — 카드 대신 이유를 보여줍니다 */
function QuoteError() {
  const t = useTranslations("quote");

  return (
    <div className="bg-background-background-100 text-14 text-gray-gray-400 flex flex-1 items-center justify-center px-6 py-20">
      {t("loadFailed")}
    </div>
  );
}

/** 대기 탭 첫 로딩 — SubHeader 자리 + CardPendingHistory 그리드 */
function PendingQuoteLoading() {
  const t = useTranslations("common");
  const summary = (
    <>
      <SkeletonBone className="h-6.5 w-28" />
      <SkeletonBone className="h-12.5 w-full" />
    </>
  );

  return (
    <SkeletonStatus
      label={t("loading")}
      className="bg-background-background-100 flex flex-1 flex-col"
    >
      {/* SubHeader 높이(sm 198 / md 202 / lg 124)를 그대로 잡아 로딩 후 아래 카드가 밀리지 않게 한다 */}
      <div className="tablet:hidden flex h-49.5 flex-col justify-center gap-3 bg-gray-50 px-6">
        {summary}
      </div>
      <div className="tablet:flex pc:hidden hidden h-50.5 flex-col justify-center gap-3 bg-gray-50 px-18">
        {summary}
      </div>
      <div className="pc:flex hidden h-31 items-center bg-gray-50">
        <div className="mx-auto flex w-full max-w-285 flex-col gap-3">{summary}</div>
      </div>

      <div className="bg-background-background-100 tablet:px-18 tablet:pt-10.5 pc:px-10 pc:pt-19.5 flex flex-1 justify-center px-6 pt-8.75 pb-20">
        <div className="tablet:max-w-150 tablet:gap-8 pc:max-w-285 pc:grid-cols-2 pc:gap-6 grid w-full max-w-81.75 grid-cols-1 gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <div className="tablet:hidden">
                <CardEstimateSkeleton size="sm" variant="pending" />
              </div>
              <div className="tablet:block hidden">
                <CardEstimateSkeleton size="lg" variant="pending" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonStatus>
  );
}

/** 지난 견적 탭 첫 로딩 — 요청 블록 1개 + CardEstimateHistory 목록 */
function PastQuoteLoading() {
  const t = useTranslations("common");

  return (
    <SkeletonStatus
      label={t("loading")}
      className="tablet:gap-8 tablet:px-9 tablet:py-8 pc:gap-10 pc:px-10 pc:py-10 flex flex-1 flex-col items-center gap-2 bg-gray-50 py-0"
    >
      <section className="tablet:max-w-150 tablet:gap-8 tablet:rounded-[20px] tablet:px-7 tablet:py-8 tablet:shadow-[inset_0_0_0_0.5px_var(--color-line-100),2px_2px_10px_0_rgba(220,220,220,0.2)] pc:max-w-280 pc:flex-row pc:gap-15 pc:px-10 pc:py-11 flex w-full flex-col gap-8 bg-white px-6 py-8">
        <div className="pc:w-65 flex shrink-0 flex-col gap-5">
          <SkeletonBone className="h-8 w-24" />
          <div className="tablet:gap-3 flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBone key={index} className="h-6 w-full" />
            ))}
          </div>
        </div>
        <div className="border-line-200 pc:block -mr-px hidden shrink-0 border-l" />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <SkeletonBone className="h-8 w-28" />
          <div className="flex flex-col gap-5">
            {/* 상태 필터 드롭다운 — 모바일·태블릿 75×36 / PC 160×50 */}
            <SkeletonBone className="pc:h-12.5 pc:w-40 h-9 w-18.75 rounded-lg" />
            <div className="divide-line-100 flex flex-col divide-y">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index}>
                  <div className="tablet:hidden">
                    <CardEstimateSkeleton size="sm" variant="history" />
                  </div>
                  <div className="tablet:block hidden">
                    <CardEstimateSkeleton size="lg" variant="history" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SkeletonStatus>
  );
}

interface MyQuotesTabsProps {
  /** 서버가 ?tab= 쿼리를 읽어 내려줍니다 */
  initialTab: QuoteTab;
}

/**
 * 내 견적 관리 (페이지 8) — 탭 2개.
 *
 * 데이터는 BE #80(견적 응답에 기사님 정보 포함) 위에서 동작합니다.
 * 그 전 응답으로는 카드에 넣을 이름·평점·경력이 없습니다.
 */
export default function MyQuotesTabs({ initialTab }: MyQuotesTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<QuoteTab>(initialTab);
  // 프로필 메뉴의 "결제 내역"처럼 같은 페이지에서 ?tab=만 바뀌어 들어오면 서버가 새 initialTab을 내려주는데,
  // useState 초기값은 한 번만 쓰여서 탭이 그대로 남습니다. 값이 바뀌면 렌더 중에 맞춰 줍니다
  const [syncedInitialTab, setSyncedInitialTab] = useState(initialTab);
  if (initialTab !== syncedInitialTab) {
    setSyncedInitialTab(initialTab);
    setTab(initialTab);
  }
  const t = useTranslations("quote");

  const pending = usePendingQuotes();
  const past = usePastQuotes();

  /**
   * 탭을 URL에도 남깁니다 — 상세에서 뒤로 왔을 때 보던 탭으로 돌아오기 위함입니다.
   * `replace`라 뒤로가기 기록이 탭 전환마다 쌓이지 않고, `scroll: false`로 전환 시
   * 스크롤이 맨 위로 튀지 않게 합니다.
   */
  const changeTab = (next: QuoteTab) => {
    setTab(next);
    router.replace(next === "pending" ? "/customer/my-quotes" : `/customer/my-quotes?tab=${next}`, {
      scroll: false,
    });
  };

  // 상세로 갈 때 현재 URL(탭 쿼리 포함)이 히스토리에 남으므로, 뒤로가기하면 그 탭으로 돌아옵니다
  const openDetail = (estimateId: number) => router.push(`/customer/my-quotes/${estimateId}`);

  return (
    // 빈 상태를 세로 가운데 두려면 높이가 필요한데, 상위 레이아웃((protected)/customer)이
    // 평범한 <div>라 flex 체인이 끊깁니다. 남의 파일을 건드리지 않고 여기서 dvh로 잡습니다.
    <div className="flex min-h-dvh flex-col">
      {/* 피그마 tab 컴포넌트(1:992)는 sm·md 54 / lg 80이고 패딩이 없습니다.
          TabList 기본 py-2.5가 54를 75로 키우고, PC는 Tab의 pc:py-4만으로 67에 그칩니다.
          공통 컴포넌트는 건드리지 않고 여기서만 보정합니다.
          TODO: 데일리 스크럼 공유 — 다른 탭 사용처에도 같은 차이가 납니다. */}
      {/* 탭이 4개라 모바일(<tablet) 폭에는 한 줄에 다 안 들어갑니다 — 줄바꿈 대신 가로로 밀어 보게 합니다.
          overflow를 PC에서는 풀어 둡니다(PC는 탭이 목록 박스 아래로 2px 나와 있어 잘립니다). */}
      <TabList
        aria-label={t("tabsLabel")}
        className="pc:h-20 max-tablet:overflow-x-auto max-tablet:[scrollbar-width:none] py-0"
      >
        <Tab
          id="tab-pending"
          controls="panel-pending"
          active={tab === "pending"}
          onClick={() => changeTab("pending")}
        >
          {t("tabPending")}
        </Tab>
        <Tab
          id="tab-past"
          controls="panel-past"
          active={tab === "past"}
          onClick={() => changeTab("past")}
        >
          {t("tabPast")}
        </Tab>
        <Tab
          id="tab-payPending"
          controls="panel-payPending"
          active={tab === "payPending"}
          className="pc:border-transparent border-transparent"
          onClick={() => changeTab("payPending")}
        >
          {t("tabPayPending")}
        </Tab>
        <Tab
          id="tab-payHistory"
          controls="panel-payHistory"
          active={tab === "payHistory"}
          className="pc:border-transparent border-transparent"
          onClick={() => changeTab("payHistory")}
        >
          {t("tabPayHistory")}
        </Tab>
      </TabList>

      {tab === "pending" && (
        <div
          id="panel-pending"
          role="tabpanel"
          aria-labelledby="tab-pending"
          tabIndex={0}
          className="flex flex-1 flex-col"
        >
          {pending.error ? (
            <QuoteError />
          ) : pending.isLoading ? (
            <PendingQuoteLoading />
          ) : (
            <PendingQuotesPanel
              request={pending.request}
              hasConfirmedRequest={pending.hasConfirmedRequest}
              estimates={pending.estimates}
              onDetailClick={openDetail}
              // TODO: 견적 확정 API(#29) 연동 — 확정 모달 흐름이 정해지면 붙입니다
              onConfirmClick={openDetail}
            />
          )}
        </div>
      )}

      {tab === "past" && (
        <div
          id="panel-past"
          role="tabpanel"
          aria-labelledby="tab-past"
          tabIndex={0}
          className="flex flex-1 flex-col"
        >
          {past.error ? (
            <QuoteError />
          ) : past.isLoading ? (
            <PastQuoteLoading />
          ) : (
            <PastQuotesPanel blocks={past.blocks} onDetailClick={openDetail} />
          )}
        </div>
      )}

      {tab === "payPending" && (
        <div
          id="panel-payPending"
          role="tabpanel"
          aria-labelledby="tab-payPending"
          tabIndex={0}
          className="flex flex-1 flex-col"
        >
          <PayQuotesPanel stage="DUE" onDetailClick={openDetail} />
        </div>
      )}

      {tab === "payHistory" && (
        <div
          id="panel-payHistory"
          role="tabpanel"
          aria-labelledby="tab-payHistory"
          tabIndex={0}
          className="flex flex-1 flex-col"
        >
          <PayQuotesPanel stage="PAID" onDetailClick={openDetail} />
        </div>
      )}
    </div>
  );
}
