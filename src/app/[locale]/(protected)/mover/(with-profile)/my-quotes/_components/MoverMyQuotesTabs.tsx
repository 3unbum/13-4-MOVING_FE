"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import emptyCharacter from "@/assets/images/common/empty-review.png";
import Button from "@/components/common/Button";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";
import MoverEstimateList from "@/components/mover/MoverEstimateList";
import CardRequestSkeleton from "@/components/skeleton/CardRequestSkeleton";
import SkeletonStatus from "@/components/skeleton/SkeletonStatus";
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
  const t = useTranslations("moverPage");
  return (
    <div className="text-14 text-gray-gray-400 tablet:text-16 flex flex-1 items-center justify-center px-6 py-20">
      {t("estimateLoadFailed")}
    </div>
  );
}

/** 첫 로딩 — MoverEstimateList와 같은 그리드. 반려 카드는 금액 줄이 없다 */
function QuoteLoading({ footer }: { footer: "price" | "none" }) {
  const t = useTranslations("common");

  return (
    <SkeletonStatus
      label={t("loading")}
      className="tablet:gap-8 pc:grid-cols-2 pc:gap-6 grid w-full grid-cols-1 gap-5"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index}>
          <div className="tablet:hidden">
            <CardRequestSkeleton size="sm" footer={footer} />
          </div>
          <div className="tablet:block hidden">
            <CardRequestSkeleton size="lg" footer={footer} />
          </div>
        </div>
      ))}
    </SkeletonStatus>
  );
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
  const t = useTranslations("moverPage");
  const tQuote = useTranslations("quote");
  const tCommon = useTranslations("common");
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
  const emptyMessage = tab === "confirmed" ? t("noConfirmed") : t("noRejected");

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* 피그마 tab 컴포넌트(1:992)는 sm·md 54 / lg 80이고 패딩이 없습니다.
          TabList 기본 py-2.5가 54를 75로 키웁니다 — 공통 컴포넌트는 두고 여기서 보정합니다. */}
      <TabList aria-label={tQuote("tabsLabel")} className="pc:h-20 py-0">
        <Tab
          id="tab-confirmed"
          controls="panel-confirmed"
          active={tab === "confirmed"}
          onClick={() => changeTab("confirmed")}
        >
          {t("sentQuotes")}
        </Tab>
        <Tab
          id="tab-rejected"
          controls="panel-rejected"
          active={tab === "rejected"}
          onClick={() => changeTab("rejected")}
        >
          {t("rejectedRequests")}
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
          // 탭 아래 여백 — 피그마 모바일 24 / 태블릿 32 / PC 55
          className="tablet:max-w-147 tablet:pt-8 pc:max-w-300 pc:pt-13.75 flex w-full max-w-82 flex-1 flex-col pt-6 pb-10"
        >
          {panel.error ? (
            <QuoteError />
          ) : panel.isPending ? (
            <QuoteLoading footer={tab === "confirmed" ? "price" : "none"} />
          ) : panel.estimates.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            <>
              <MoverEstimateList estimates={panel.estimates} onDetailClick={openDetail} />

              {/* 피그마 목록에는 페이지네이션도 t("loadMore")도 없습니다(시안이 4~6건 기준).
                  실제로는 55건인 계정이 있어 12건 뒤가 보이지 않아 넣었습니다.
                  공용 `Pagination`은 `totalPages`가 필요한데 BE가 커서만 주고
                  총 개수를 안 줘서 쓸 수 없습니다. */}
              {panel.hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outlined"
                    size="sm"
                    className="w-full max-w-81.75"
                    disabled={panel.isFetchingNextPage}
                    onClick={panel.fetchNextPage}
                  >
                    {panel.isFetchingNextPage ? tCommon("loading") : t("loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
