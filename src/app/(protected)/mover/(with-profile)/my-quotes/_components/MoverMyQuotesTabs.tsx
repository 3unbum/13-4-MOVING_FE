"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import emptyCharacter from "@/assets/images/common/empty-review.png";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";
import MoverEstimateList from "@/components/mover/MoverEstimateList";
import { useConfirmedEstimates, useRejectedEstimates } from "@/hooks/useMoverEstimates";

type QuoteTab = "confirmed" | "rejected";

/**
 * 빈 목록 화면 — 받은 요청과 같은 `img/Component/empty`입니다.
 *
 * 리뷰·찜·받은 요청이 이미 각자 구현 중이라 여기도 따로 둡니다.
 * 나중에 `components/common/`으로 올리면 넷이 공유할 수 있습니다.
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="pc:w-[955px] pc:gap-8 flex w-81.75 flex-col items-center gap-6">
        {/* 240×196 클립 안에 260.633 원본을 음수 위치로 밀어 넣습니다 */}
        <div className="relative h-49 w-60 overflow-hidden">
          <Image
            src={emptyCharacter}
            alt=""
            width={1000}
            height={1000}
            className="absolute top-[-16.29px] left-[-11.04px] size-[260.633px] max-w-none opacity-50 grayscale"
          />
        </div>
        <p className="text-16 pc:text-20 text-gray-gray-400 text-center whitespace-nowrap">
          {message}
        </p>
      </div>
    </div>
  );
}

function QuoteError() {
  return (
    <div className="text-14 text-gray-gray-400 tablet:text-16 flex flex-1 items-center justify-center px-6 py-20">
      견적을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
    </div>
  );
}

/** 로딩 — 스켈레톤은 컴포넌트 단위로 하기로 했으나(9/6 멘토링) 후속 작업으로 둡니다 */
function QuoteLoading() {
  return <div className="flex flex-1" aria-busy="true" />;
}

interface MoverMyQuotesTabsProps {
  /** 서버가 `?tab=` 쿼리를 읽어 내려줍니다 */
  initialTab: QuoteTab;
}

/**
 * 내 견적 관리 (페이지 16, 기사님) — 탭 2개.
 *
 * 피그마 `1:9297`(확정 PC) / `1:9531`(반려 PC). 확정 탭에는 고객 견적과 이사완료
 * 카드가 섞여 나옵니다 — 이사완료가 별도 탭이 아니라 확정 안에 들어갑니다.
 *
 * 일반 유저의 "내 견적 관리"(페이지 8)와 이름이 같지만 다른 페이지입니다.
 */
export default function MoverMyQuotesTabs({ initialTab }: MoverMyQuotesTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<QuoteTab>(initialTab);

  const confirmed = useConfirmedEstimates();
  const rejected = useRejectedEstimates();

  /**
   * 탭을 URL에도 남깁니다 — 상세에서 뒤로 왔을 때 보던 탭으로 돌아오기 위함입니다.
   * `replace`라 뒤로가기 기록이 탭 전환마다 쌓이지 않고, `scroll: false`로 전환 시
   * 스크롤이 맨 위로 튀지 않게 합니다.
   */
  const changeTab = (next: QuoteTab) => {
    setTab(next);
    router.replace(next === "rejected" ? "/mover/my-quotes?tab=rejected" : "/mover/my-quotes", {
      scroll: false,
    });
  };

  const openDetail = (estimateId: number) => router.push(`/mover/my-quotes/${estimateId}`);

  const panel = tab === "confirmed" ? confirmed : rejected;
  const emptyMessage =
    tab === "confirmed" ? "아직 확정된 견적이 없어요!" : "아직 반려한 견적이 없어요!";

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* 피그마 tab 컴포넌트(1:992)는 sm·md 54 / lg 80이고 패딩이 없습니다.
          TabList 기본 py-2.5가 54를 75로 키웁니다 — 공통 컴포넌트는 두고 여기서 보정합니다. */}
      <TabList aria-label="내 견적 관리 탭" className="pc:h-20 py-0">
        <Tab
          id="tab-confirmed"
          controls="panel-confirmed"
          active={tab === "confirmed"}
          onClick={() => changeTab("confirmed")}
        >
          보낸 견적 조회
        </Tab>
        <Tab
          id="tab-rejected"
          controls="panel-rejected"
          active={tab === "rejected"}
          onClick={() => changeTab("rejected")}
        >
          반려 요청
        </Tab>
      </TabList>

      <div className="tablet:px-18 pc:px-10 flex flex-1 flex-col items-center px-6">
        {/* 피그마 여백을 패딩으로 옮기면 1280에서 그리드가 짓눌립니다 —
            max-w + 중앙정렬로 잡습니다 (PC 1200 / 태블릿 588) */}
        <div
          id={`panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          tabIndex={0}
          className="tablet:max-w-147 pc:max-w-300 flex w-full max-w-82 flex-1 flex-col pt-8 pb-10"
        >
          {panel.error ? (
            <QuoteError />
          ) : panel.isPending ? (
            <QuoteLoading />
          ) : panel.estimates.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            <MoverEstimateList estimates={panel.estimates} onDetailClick={openDetail} />
          )}
        </div>
      </div>
    </div>
  );
}
