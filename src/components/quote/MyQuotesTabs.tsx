"use client";

import { useState } from "react";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";
import PastQuotesPanel from "@/components/quote/PastQuotesPanel";
import PendingQuotesPanel from "@/components/quote/PendingQuotesPanel";
import { MOCK_ACTIVE_REQUEST, MOCK_PAST_REQUESTS } from "@/lib/mocks/my-quotes";

type QuoteTab = "pending" | "past";

/**
 * 내 견적 관리 (페이지 8) — 탭 2개.
 *
 * TODO: 데이터는 아직 목업입니다. BE가 견적 목록에 기사님 정보를 포함하지 않아
 * (estimate 테이블 컬럼만 응답) 카드를 채울 수 없습니다 — BE 이슈 #80 머지 후
 * `src/lib/mocks/my-quotes.ts`를 지우고 실제 API로 교체합니다.
 */
export default function MyQuotesTabs() {
  const [tab, setTab] = useState<QuoteTab>("pending");

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
          onClick={() => setTab("pending")}
        >
          대기 중인 견적
        </Tab>
        <Tab
          id="tab-past"
          controls="panel-past"
          active={tab === "past"}
          onClick={() => setTab("past")}
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
          <PendingQuotesPanel request={MOCK_ACTIVE_REQUEST} />
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
          <PastQuotesPanel requests={MOCK_PAST_REQUESTS} />
        </div>
      )}
    </div>
  );
}
