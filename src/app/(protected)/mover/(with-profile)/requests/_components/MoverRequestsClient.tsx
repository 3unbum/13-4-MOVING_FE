"use client";

import { useState } from "react";
import Loading from "@/app/loading";
import Header from "@/components/common/Header";
import Toast from "@/components/common/Toast";
import FilterModal from "@/components/filter/FilterModal";
import MoverRequestFilters, {
  type MoverRequestFilterState,
} from "@/components/mover/MoverRequestFilters";
import MoverRequestList from "@/components/mover/MoverRequestList";
import QuoteActionModal from "@/components/quote/QuoteActionModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMoverRequestAction, useMoverRequests } from "@/hooks/useMoverRequests";
import type { MoverRequest } from "@/lib/services/mover-request-service";
import { shortenAddress } from "@/lib/utils/address";
import { formatMovingDate } from "@/lib/utils/date";

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

const INITIAL_FILTERS: MoverRequestFilterState = {
  category: undefined,
  isTargeted: false,
  isServiceRegion: false,
  sort: "latest",
};

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

  const [filters, setFilters] = useState<MoverRequestFilterState>(INITIAL_FILTERS);
  // 입력은 즉시 반영하고 API 호출만 미룹니다 — 타이핑마다 부르면 요청이 쏟아집니다
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // 바텀시트는 "조회하기"를 눌러야 반영돼서, 닫기 전까지는 임시 상태로 들고 있습니다
  const [draftFilters, setDraftFilters] = useState<MoverRequestFilterState>(INITIAL_FILTERS);

  // 열려 있는 모달 — 어떤 요청에 대한 것인지 함께 들고 있어야 제출 때 id를 씁니다
  const [action, setAction] = useState<{
    variant: "send" | "reject";
    request: MoverRequest;
  } | null>(null);
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const { requests, isPending, error } = useMoverRequests({
    ...filters,
    search: debouncedKeyword.trim() || undefined,
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { sendEstimate, reject } = useMoverRequestAction(() =>
    showToast("처리에 실패했어요. 잠시 후 다시 시도해 주세요.")
  );

  const headerSize = isPc ? "lg" : isTabletUp ? "md" : "sm";

  const openFilterModal = () => {
    setDraftFilters(filters);
    setIsFilterOpen(true);
  };

  const applyDraft = () => {
    setFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const openAction = (variant: "send" | "reject", request: MoverRequest) => {
    // 이전 입력이 남아 있으면 다른 요청에 그대로 보내질 수 있어 매번 비웁니다
    setPrice("");
    setComment("");
    setAction({ variant, request });
  };

  const submitAction = () => {
    if (!action) return;
    const { variant, request } = action;

    const onSuccess = () => {
      setAction(null);
      showToast(variant === "send" ? "견적을 보냈어요." : "요청을 반려했어요.");
    };

    if (variant === "send") {
      sendEstimate.mutate({ requestId: request.id, price: Number(price), comment }, { onSuccess });
    } else {
      reject.mutate({ requestId: request.id, comment }, { onSuccess });
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <Header size={headerSize}>받은 요청</Header>

      <div className="tablet:px-18 pc:px-10 flex flex-1 flex-col items-center px-6">
        {/* 피그마 여백을 패딩으로 옮기면 1280에서 그리드가 짓눌립니다 —
            max-w + 중앙정렬로 잡습니다 (PC 1200 / 태블릿 600) */}
        <div className="tablet:max-w-150 pc:max-w-300 flex w-full max-w-81.75 flex-1 flex-col pt-3 pb-10">
          <MoverRequestFilters
            filters={filters}
            onChange={setFilters}
            keyword={keyword}
            onKeywordChange={setKeyword}
            totalCount={requests.length}
            onOpenFilterModal={openFilterModal}
          />

          {/* 카드 위 간격 — 피그마 PC 24 / 태블릿 30 / 모바일 26.
              공용 Sort가 피그마(32)보다 8px 높아 그만큼 뺀 값입니다. */}
          <div className="tablet:mt-3 pc:mt-8 mt-2 flex flex-1 flex-col">
            {error ? (
              <Message>요청을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Message>
            ) : isPending ? (
              <Loading />
            ) : requests.length === 0 ? (
              <Message>조건에 맞는 요청이 없어요.</Message>
            ) : (
              <MoverRequestList
                requests={requests}
                onSendEstimate={(request) => openAction("send", request)}
                onReject={(request) => openAction("reject", request)}
              />
            )}
          </div>
        </div>
      </div>

      {/* 태블릿·모바일 필터 바텀시트 */}
      <FilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        moveType={draftFilters.category}
        onMoveTypeChange={(value) =>
          // 선택된 칩을 다시 누르면 해제 — 피그마에 "전체" 칩이 없습니다
          setDraftFilters((prev) => ({
            ...prev,
            category: prev.category === value ? undefined : value,
          }))
        }
        isTargetedOnly={draftFilters.isTargeted}
        onTargetedOnlyChange={(value) =>
          setDraftFilters((prev) => ({ ...prev, isTargeted: value }))
        }
        isServiceAreaOnly={draftFilters.isServiceRegion}
        onServiceAreaOnlyChange={(value) =>
          setDraftFilters((prev) => ({ ...prev, isServiceRegion: value }))
        }
        onApply={applyDraft}
      />

      {/* 견적 보내기 · 반려 모달.
          피그마상 모달 폭은 PC 608 / 태블릿·모바일 375라 태블릿이 `sm`을 씁니다
          (`1:10654` / `1:10608` / `1:10716`). 필터 바텀시트와 같은 기준입니다. */}
      {action && (
        <QuoteActionModal
          open
          onClose={() => setAction(null)}
          variant={action.variant}
          size={isPc ? "md" : "sm"}
          // 태블릿은 폭이 모바일과 같은 375지만 가운데 뜹니다 (피그마 x=185, 744 프레임)
          position={isTabletUp ? "center" : "bottom"}
          category={action.request.category}
          // 지정 견적 여부는 목록 응답에 없습니다 — 칩을 띄울 근거가 없어 끕니다
          isTargeted={false}
          customerName={action.request.userName}
          fromAddress={shortenAddress(action.request.fromAddress)}
          toAddress={shortenAddress(action.request.toAddress)}
          movingDate={formatMovingDate(action.request.movingDate)}
          price={price}
          onPriceChange={setPrice}
          comment={comment}
          onCommentChange={setComment}
          reason={comment}
          onReasonChange={setComment}
          onSubmit={submitAction}
        />
      )}

      {toast && <Toast message={toast} size={isPc ? "md" : "sm"} />}
    </div>
  );
}
