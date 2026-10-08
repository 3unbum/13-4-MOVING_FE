"use client";

import {
  CardCompleted,
  CardCustomerQuotation,
  CardRejectedRequest,
} from "@/components/quote/CardQuotation";
import type { MoverEstimate } from "@/lib/services/mover-estimate-service";
import { useLocale } from "next-intl";
import { shortenAddress } from "@/lib/utils/address";
import { formatMovingDate, type DateLocale } from "@/lib/utils/date";

interface MoverEstimateListProps {
  estimates: MoverEstimate[];
  onDetailClick?: (estimateId: number) => void;
}

/** 카드 한 장 — size만 다른 두 벌을 CSS로 전환합니다 (JS 미디어쿼리는 첫 렌더에 깜빡임) */
function EstimateCard({
  estimate,
  onDetailClick,
}: {
  estimate: MoverEstimate;
  onDetailClick?: () => void;
}) {
  const locale = useLocale() as DateLocale;
  const { quotationRequest: request } = estimate;

  const common = {
    category: request.category,
    isTargeted: estimate.isTargeted,
    customerName: request.userName,
    from: shortenAddress(request.fromAddress),
    to: shortenAddress(request.toAddress),
    movingDate: formatMovingDate(request.movingDate, locale),
  };

  // 반려는 금액이 없고(BE가 null), 나머지는 항상 있습니다
  const price = estimate.price ?? 0;

  const render = (size: "sm" | "lg") => {
    switch (estimate.estimateStatus) {
      case "REJECTED":
        return <CardRejectedRequest size={size} {...common} />;
      case "COMPLETED":
        return (
          <CardCompleted
            size={size}
            price={price}
            isConfirmed
            onDetailClick={onDetailClick}
            {...common}
          />
        );
      // PENDING(보냈고 결과 대기) / CONFIRMED(확정, 이사 전) — 같은 카드에 배지만 갈립니다.
      // 피그마 `1:9301`이 확정(배지 O), `1:9302`가 대기(배지 X)입니다.
      //
      // 이사완료 카드에만 "견적 상세보기" 버튼이 있어 이 둘은 상세로 갈 길이 없었습니다.
      // 정작 주소가 필요한 건 이사 전(CONFIRMED)이라 카드 전체를 눌러 들어가게 했습니다.
      default:
        return (
          <CardCustomerQuotation
            size={size}
            price={price}
            isConfirmed={estimate.estimateStatus === "CONFIRMED"}
            onCardClick={onDetailClick}
            {...common}
          />
        );
    }
  };

  return (
    <>
      <div className="tablet:hidden">{render("sm")}</div>
      <div className="tablet:block hidden">{render("lg")}</div>
    </>
  );
}

/**
 * 내 견적 카드 목록 (페이지 16, 기사님).
 *
 * 보낸 견적 탭에는 고객 견적(PENDING·CONFIRMED)과 이사완료(COMPLETED) 카드가 섞여
 * 나옵니다 (피그마 `1:9297`). 반려 탭은 반려 요청 카드만입니다(`1:9531`).
 *
 * 그리드는 PC만 2열이고, 카드는 폭을 갖지 않으므로 그리드 칸이 폭을 정합니다.
 */
export default function MoverEstimateList({ estimates, onDetailClick }: MoverEstimateListProps) {
  return (
    // 카드 간격 — 피그마 모바일 20 / 태블릿 32 / PC 24 (가로·세로 모두 24)
    <div className="tablet:gap-8 pc:grid-cols-2 pc:gap-6 grid w-full grid-cols-1 gap-5">
      {estimates.map((estimate) => (
        <EstimateCard
          key={estimate.id}
          estimate={estimate}
          onDetailClick={() => onDetailClick?.(estimate.id)}
        />
      ))}
    </div>
  );
}
