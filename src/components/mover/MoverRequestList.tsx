"use client";

import { CardReceivedRequest } from "@/components/quote/CardQuotation";
import type { MoverRequest } from "@/lib/services/mover-request-service";
import { shortenAddress } from "@/lib/utils/address";
import { formatElapsedTime, formatMovingDate } from "@/lib/utils/date";

interface MoverRequestListProps {
  requests: MoverRequest[];
  onSendEstimate?: (request: MoverRequest) => void;
  onReject?: (request: MoverRequest) => void;
}

/** 카드 한 장 — size만 다른 두 벌을 CSS로 전환합니다 (JS 미디어쿼리는 첫 렌더에 깜빡임) */
function RequestCard({
  request,
  onSendEstimate,
  onReject,
}: {
  request: MoverRequest;
  onSendEstimate?: () => void;
  onReject?: () => void;
}) {
  const common = {
    category: request.category,
    isTargeted: request.isTargeted,
    customerName: request.userName,
    from: shortenAddress(request.fromAddress),
    to: shortenAddress(request.toAddress),
    movingDate: formatMovingDate(request.movingDate),
    elapsedTime: formatElapsedTime(request.createdAt),
    onSendEstimate,
    onReject,
  };

  return (
    <>
      <div className="tablet:hidden">
        <CardReceivedRequest size="sm" {...common} />
      </div>
      <div className="tablet:block hidden">
        <CardReceivedRequest size="lg" {...common} />
      </div>
    </>
  );
}

/**
 * 받은 요청 카드 목록.
 *
 * 그리드는 PC만 2열입니다 (피그마 `1:10455` 588×2 + gap 24 = 1200).
 * 카드는 폭을 갖지 않으므로 그리드 칸이 폭을 정합니다.
 */
export default function MoverRequestList({
  requests,
  onSendEstimate,
  onReject,
}: MoverRequestListProps) {
  return (
    <div className="tablet:gap-8 pc:grid-cols-2 pc:gap-6 grid w-full grid-cols-1 gap-6">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onSendEstimate={() => onSendEstimate?.(request)}
          onReject={() => onReject?.(request)}
        />
      ))}
    </div>
  );
}
