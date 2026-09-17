"use client";

import Header from "@/components/common/Header";
import MoverRequestList from "@/components/mover/MoverRequestList";
import Loading from "@/app/loading";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMoverRequests } from "@/hooks/useMoverRequests";

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-14 text-gray-gray-400 tablet:text-16 flex flex-1 items-center justify-center px-6 py-20">
      {children}
    </div>
  );
}

/**
 * 받은 요청 (페이지 15, 기사님).
 *
 * 피그마 `1:10431`(PC) / `1:10344`(Tablet) / `1:10515`(Mobile).
 * 내용 폭은 PC 1200 / 태블릿 600 / 모바일 327이고, 카드는 PC만 2열입니다.
 */
export default function MoverRequestsClient() {
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const isPc = useMediaQuery(PC_QUERY);

  const { requests, isPending, error } = useMoverRequests();

  const headerSize = isPc ? "lg" : isTabletUp ? "md" : "sm";

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <Header size={headerSize}>받은 요청</Header>

      <div className="tablet:px-18 pc:px-10 flex flex-1 flex-col items-center px-6">
        {/* 피그마 여백을 패딩으로 옮기면 1280에서 그리드가 짓눌립니다 —
            max-w + 중앙정렬로 잡습니다 (PC 1200 / 태블릿 600) */}
        <div className="tablet:max-w-150 pc:max-w-300 flex w-full max-w-81.75 flex-1 flex-col">
          {error ? (
            <Message>요청을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Message>
          ) : isPending ? (
            <Loading />
          ) : requests.length === 0 ? (
            <Message>아직 받은 요청이 없어요.</Message>
          ) : (
            <MoverRequestList requests={requests} />
          )}
        </div>
      </div>
    </div>
  );
}
