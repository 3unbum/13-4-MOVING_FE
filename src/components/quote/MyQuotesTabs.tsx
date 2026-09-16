"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";
import PastQuotesPanel from "@/components/quote/PastQuotesPanel";
import PendingQuotesPanel from "@/components/quote/PendingQuotesPanel";
import { usePastQuotes, usePendingQuotes } from "@/hooks/useMyQuotes";

type QuoteTab = "pending" | "past";

/** 조회 실패 시 — 카드 대신 이유를 보여줍니다 */
function QuoteError() {
  return (
    <div className="bg-background-background-100 text-14 text-gray-gray-400 flex flex-1 items-center justify-center px-6 py-20">
      견적을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
    </div>
  );
}

/** 로딩 — 스켈레톤은 컴포넌트 단위로 하기로 했으나(9/6 멘토링) 이 페이지는 후속 작업으로 둡니다 */
function QuoteLoading() {
  return <div className="bg-background-background-100 flex flex-1" aria-busy="true" />;
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

  const pending = usePendingQuotes();
  const past = usePastQuotes();

  /**
   * 탭을 URL에도 남깁니다 — 상세에서 뒤로 왔을 때 보던 탭으로 돌아오기 위함입니다.
   * `replace`라 뒤로가기 기록이 탭 전환마다 쌓이지 않고, `scroll: false`로 전환 시
   * 스크롤이 맨 위로 튀지 않게 합니다.
   */
  const changeTab = (next: QuoteTab) => {
    setTab(next);
    router.replace(next === "past" ? "/customer/my-quotes?tab=past" : "/customer/my-quotes", {
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
      <TabList aria-label="내 견적 관리 탭" className="pc:h-20 py-0">
        <Tab
          id="tab-pending"
          controls="panel-pending"
          active={tab === "pending"}
          onClick={() => changeTab("pending")}
        >
          대기 중인 견적
        </Tab>
        <Tab
          id="tab-past"
          controls="panel-past"
          active={tab === "past"}
          onClick={() => changeTab("past")}
        >
          받았던 견적
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
            <QuoteLoading />
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
            <QuoteLoading />
          ) : (
            <PastQuotesPanel blocks={past.blocks} onDetailClick={openDetail} />
          )}
        </div>
      )}
    </div>
  );
}
