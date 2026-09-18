"use client";

import Image from "next/image";
import { useState } from "react";
import Loading from "@/app/loading";
import emptyCharacter from "@/assets/images/common/empty-review.png";
import Header from "@/components/common/Header";
import Toast from "@/components/common/Toast";
import FilterModal from "@/components/filter/FilterModal";
import MoverRequestFilters, {
  toggleCategory,
  type MoverRequestFilterState,
} from "@/components/mover/MoverRequestFilters";
import MoverRequestList from "@/components/mover/MoverRequestList";
import QuoteActionModal from "@/components/quote/QuoteActionModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMoverRequestAction, useMoverRequests } from "@/hooks/useMoverRequests";
import type { MoverRequest } from "@/lib/services/mover-request-service";
import { shortenAddress } from "@/lib/utils/address";
import { formatMovingDate } from "@/lib/utils/date";

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

const INITIAL_FILTERS: MoverRequestFilterState = {
  categories: [],
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
 * 빈 목록 화면 — 피그마 `1:10485`(PC 955×620) / `1:10554`(모바일 327×484).
 *
 * `img/Component/empty`는 리뷰·찜 화면과 같은 컴포넌트입니다. 다만 그쪽은
 * `_components/` 안에 있어 가져올 수 없고, PC 문구 크기도 다릅니다
 * (리뷰 24 / 여기 20). 캐릭터 클립 수치는 피그마 그대로입니다.
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

  const { requests, isPending, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useMoverRequests({
      ...filters,
      search: debouncedKeyword.trim() || undefined,
    });

  // 목록 하단 sentinel이 보이면 다음 페이지 — 12건이 넘으면 첫 페이지만 보였습니다
  const sentinelRef = useInfiniteScrollTrigger(() => fetchNextPage(), {
    enabled: hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { sendEstimate, reject } = useMoverRequestAction(() =>
    showToast("처리에 실패했어요. 잠시 후 다시 시도해 주세요.")
  );

  const headerSize = isPc ? "lg" : isTabletUp ? "md" : "sm";
  const hasActiveFilter =
    debouncedKeyword.trim().length > 0 ||
    filters.categories.length > 0 ||
    filters.isTargeted ||
    filters.isServiceRegion;

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

  // 전송 중 재진입 차단 — 버튼 disabled와 별개로 한 겹 더 둡니다(엔터 연타 등)
  const isSubmitting = sendEstimate.isPending || reject.isPending;

  const submitAction = () => {
    if (!action || isSubmitting) return;
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
      {/* 피그마(`1:10434`)는 PC에서 제목이 1200 콘텐츠 + 좌우 8 패딩 안에 들어갑니다
          (텍스트 x=368 = 360+8). 공용 Header의 `px-92`는 1920에서만 맞는 고정값이라
          같은 결과를 max-w로 냅니다 — 다른 페이지에 영향을 주지 않도록 여기서만 덮습니다 */}
      <Header size={headerSize} className="pc:px-0">
        <span className="pc:mx-auto pc:block pc:w-full pc:max-w-300 pc:px-2">받은 요청</span>
      </Header>

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
              // 피그마 empty 문구는 "아직 받은 요청이 없어요!" 하나뿐이라, 검색·필터로
              // 걸러져 0건인 경우는 원인을 알 수 있게 문구만 바꿔 같은 화면을 씁니다
              <EmptyState
                message={
                  hasActiveFilter ? "조건에 맞는 요청이 없어요!" : "아직 받은 요청이 없어요!"
                }
              />
            ) : (
              <>
                <MoverRequestList
                  requests={requests}
                  onSendEstimate={(request) => openAction("send", request)}
                  onReject={(request) => openAction("reject", request)}
                />
                <div ref={sentinelRef} aria-hidden className="h-px" />
                {isFetchingNextPage && (
                  <p className="text-14 text-gray-gray-400 py-6 text-center">불러오는 중...</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 태블릿·모바일 필터 바텀시트 */}
      <FilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        // 태블릿은 견적·반려 모달과 마찬가지로 가운데 뜹니다 (피그마 `1:10385`)
        position={isTabletUp ? "center" : "bottom"}
        moveTypes={draftFilters.categories}
        onMoveTypeChange={(value) =>
          // 여러 개를 켤 수 있고, 켜진 칩을 다시 누르면 꺼집니다
          setDraftFilters((prev) => ({
            ...prev,
            categories: toggleCategory(prev.categories, value),
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
          isTargeted={action.request.isTargeted}
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
          isSubmitting={isSubmitting}
          onSubmit={submitAction}
        />
      )}

      {toast && <Toast message={toast} size={isPc ? "md" : "sm"} />}
    </div>
  );
}
