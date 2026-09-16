import { CardPendingHistory } from "@/components/quote/CardEstimate";
import QuoteEmptyState from "@/components/quote/QuoteEmptyState";
import SubHeader from "@/components/common/SubHeader";
import type { Estimate } from "@/lib/services/estimate-service";
import type { QuotationRequest } from "@/lib/services/quotation-request-service";

interface PendingQuotesPanelProps {
  /** 확정 전(PENDING) 활성 요청. 없으면 빈 상태로 갈립니다 */
  request: QuotationRequest | null;
  /** 요청은 있으나 이미 견적을 확정한 상태 — 빈 상태 문구가 갈립니다 */
  hasConfirmedRequest?: boolean;
  estimates: Estimate[];
  onDetailClick?: (estimateId: number) => void;
  onConfirmClick?: (estimateId: number) => void;
}

/** 카드 한 장 — size만 다른 두 벌을 CSS로 전환합니다 */
function EstimateCard({
  estimate,
  size,
  onDetailClick,
  onConfirmClick,
}: {
  estimate: Estimate;
  size: "sm" | "lg";
  onDetailClick?: () => void;
  onConfirmClick?: () => void;
}) {
  return (
    <CardPendingHistory
      size={size}
      category={estimate.quotationRequest.category}
      isTargeted={estimate.isTargeted}
      // 카드 제목은 기사님 한 줄 소개입니다
      title={estimate.mover.bio}
      // 이 탭은 확정 전(PENDING) 견적만 다뤄 price가 항상 있습니다.
      // (금액이 없는 건 반려 견적뿐이고 그건 "받았던 견적" 탭에 나옵니다)
      price={estimate.price ?? 0}
      nickName={estimate.mover.nickName}
      profileImage={estimate.mover.image}
      rating={estimate.mover.avgRating}
      reviewCount={estimate.mover.reviewCount}
      career={estimate.mover.career}
      confirmedCount={estimate.mover.confirmedCount}
      favoriteCount={estimate.mover.favoriteCount}
      onDetailClick={onDetailClick}
      onConfirmClick={onConfirmClick}
    />
  );
}

/**
 * 대기 중인 견적 탭 (피그마 510:40184 / 510:40155 / 510:40211).
 *
 * 상단에 활성 요청 요약(SubHeader), 아래에 받은 견적 카드 목록.
 * PC만 2열이고 태블릿·모바일은 1열입니다.
 *
 * 카드 size와 SubHeader size는 JS 미디어쿼리 대신 CSS로 전환합니다 —
 * 첫 렌더 깜빡임이 없고, 서버 컴포넌트로 둘 수 있습니다.
 */
export default function PendingQuotesPanel({
  request,
  hasConfirmedRequest = false,
  estimates,
  onDetailClick,
  onConfirmClick,
}: PendingQuotesPanelProps) {
  // 확정을 마친 요청이 있는 상태. 이사가 끝나기 전까지는 새 요청을 할 수 없으므로
  // ("한 번에 하나의 이사 정보만 활성" — BE가 ACTIVE_REQUEST_EXISTS로 막습니다)
  // 요청 CTA 대신 확정한 견적을 어디서 볼 수 있는지 알려줍니다.
  if (!request && hasConfirmedRequest) {
    return <QuoteEmptyState message={"견적을 확정했어요.\n'받았던 견적'에서 확인할 수 있어요!"} />;
  }

  // 요청 자체가 없으면 SubHeader에 채울 값이 없어 통째로 숨깁니다 (피그마에 없는 화면 — 9/11 회의록 기준)
  if (!request) {
    return (
      <QuoteEmptyState
        message={"아직 견적 요청이 없어요.\n지금 바로 견적을 요청해보세요!"}
        action={{ label: "견적 요청하러 가기", href: "/customer/quotation-requests" }}
      />
    );
  }

  const subHeaderProps = {
    category: request.category,
    createdAt: request.createdAt,
    fromAddress: request.fromAddress,
    toAddress: request.toAddress,
    movingDate: request.movingDate,
  };

  return (
    <>
      {/* SubHeader는 size별로 레이아웃이 크게 달라 세 벌을 CSS로 전환합니다.
          숨김 해제는 반드시 flex로 — block을 쓰면 SubHeader 내부의 flex-row(lg)가 죽어
          가로 배치가 세로로 쌓입니다(실측: 높이 124 → 174).

          py-*는 피그마 높이(sm 198 / md 202 / lg 124)에 맞춘 보정입니다. 공통 컴포넌트
          기본값으로는 sm 192 / md 194 / lg 148이 나옵니다.
          TODO: 데일리 스크럼 공유 — SubHeader 자체를 고치는 게 근본 해결입니다. */}
      <SubHeader {...subHeaderProps} size="sm" className="tablet:hidden bg-gray-50 py-6.75" />
      <SubHeader
        {...subHeaderProps}
        size="md"
        className="tablet:flex pc:hidden tablet:py-9 hidden bg-gray-50"
      />
      {/* lg 기본값 pr-100 pl-80(합 720)은 피그마 1920 기준이라 1280에서는 내용 영역이
          560px만 남아 "울산 남구"가 줄바꿈됩니다. 배경은 전체 폭을 유지해야 해서
          바깥 div가 배경을, 안쪽 SubHeader가 카드 그리드(1140)와 같은 폭을 맡습니다. */}
      <div className="pc:block hidden bg-gray-50">
        <SubHeader {...subHeaderProps} size="lg" className="mx-auto w-full max-w-285 px-0 py-8" />
      </div>

      {estimates.length === 0 ? (
        // 유일하게 피그마에 있는 빈 상태 (510:40203 / 510:40174 / 510:40230)
        <QuoteEmptyState
          showIllustration
          message={"기사님들이 열심히 확인 중이에요\n곧 견적이 도착할 거예요!"}
        />
      ) : (
        <div className="bg-background-background-100 tablet:px-18 tablet:pt-10.5 pc:px-10 pc:pt-19.5 flex flex-1 justify-center px-6 pt-8.75 pb-20">
          {/* 상단 여백은 피그마 실측(모바일 35 / 태블릿 42 / PC 78).
              PC만 2열(558×2 + gap 24 = 1140). 카드는 폭을 갖지 않으므로 그리드가 폭을 정합니다.
              좌우 여백은 패딩이 아니라 max-w + 중앙정렬로 잡습니다 — 피그마 여백(1920 기준 390)을
              패딩으로 그대로 옮기면 1280에서 카드가 짓눌립니다(1140 중앙정렬이면 1280에서 70). */}
          {/* 카드 세로 간격 — 모바일 20(`510:40216` 404→424) / 태블릿 32 / PC 24 */}
          <div className="tablet:max-w-150 tablet:gap-8 pc:max-w-285 pc:grid-cols-2 pc:gap-6 grid w-full max-w-81.75 grid-cols-1 gap-5">
            {estimates.map((estimate) => {
              const handlers = {
                onDetailClick: () => onDetailClick?.(estimate.id),
                onConfirmClick: () => onConfirmClick?.(estimate.id),
              };

              return (
                // 그리드 칸 하나 = 카드 하나. 안에서 sm/lg 두 벌을 CSS로 전환합니다
                <div key={estimate.id}>
                  <div className="tablet:hidden">
                    <EstimateCard estimate={estimate} size="sm" {...handlers} />
                  </div>
                  <div className="tablet:block hidden">
                    <EstimateCard estimate={estimate} size="lg" {...handlers} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
