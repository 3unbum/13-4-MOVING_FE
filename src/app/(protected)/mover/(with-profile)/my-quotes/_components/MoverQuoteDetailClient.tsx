"use client";

import Image from "next/image";
import logoMark from "@/assets/icons/logo-mark-sm.svg";
import Header from "@/components/common/Header";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMoverEstimate } from "@/hooks/useMoverEstimates";
import MoverQuoteDetailView from "./MoverQuoteDetailView";

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-14 text-gray-gray-400 tablet:text-16 flex flex-1 items-center justify-center px-6 py-20">
      {children}
    </div>
  );
}

interface MoverQuoteDetailClientProps {
  estimateId: number;
}

/**
 * 견적 상세 (페이지 16 하위, 기사님).
 *
 * BE `GET /mover/estimates/:id`는 **본인이 보낸 견적만** 내려줍니다(남의 것은 403).
 * 그래서 화면에서 소유권을 따로 확인하지 않습니다.
 */
export default function MoverQuoteDetailClient({ estimateId }: MoverQuoteDetailClientProps) {
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const isPc = useMediaQuery(PC_QUERY);
  const { data: estimate, isPending, error } = useMoverEstimate(estimateId);

  const headerSize = isPc ? "lg" : isTabletUp ? "md" : "sm";

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* 받은 요청과 같은 이유로 PC만 콘텐츠 폭에 맞춥니다 (공용 Header의 px-92는 1920 고정값) */}
      <Header size={headerSize} className="pc:px-0">
        <span className="pc:mx-auto pc:block pc:w-full pc:max-w-300 pc:px-2">견적 상세</span>
      </Header>

      {/* 히어로 — 주황 배경에 무빙 로고 마크가 흐리게 흩어집니다
          (피그마 `1:9454` 모바일 122 / `1:9436` 태블릿 157 / `1:9367` PC 180).
          고객 견적 상세(`QuoteDetailView`)와 같은 띠입니다. */}
      <div
        className="tablet:h-39.25 pc:h-45 relative h-30.5 w-full overflow-hidden bg-orange-400"
        aria-hidden
      >
        <Image
          src={logoMark}
          alt=""
          className="pc:w-40 pointer-events-none absolute -top-4 left-[8%] w-24 opacity-15"
        />
        <Image
          src={logoMark}
          alt=""
          className="pc:w-56 pointer-events-none absolute top-6 left-[58%] w-32 opacity-15"
        />
      </div>

      {error ? (
        <Message>견적을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Message>
      ) : isPending ? (
        <div className="flex flex-1" aria-busy="true" />
      ) : (
        <MoverQuoteDetailView
          estimate={estimate}
          moverId={estimate.moverId}
          // 공유 문구에 쓰는 이름 — 상세 응답의 mover는 본인 프로필입니다
          moverNickName={estimate.mover.nickName}
        />
      )}
    </div>
  );
}
