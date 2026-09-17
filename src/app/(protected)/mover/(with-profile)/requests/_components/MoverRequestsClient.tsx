"use client";

import { useState } from "react";
import Loading from "@/app/loading";
import Header from "@/components/common/Header";
import FilterModal from "@/components/filter/FilterModal";
import MoverRequestFilters, {
  type MoverRequestFilterState,
} from "@/components/mover/MoverRequestFilters";
import MoverRequestList from "@/components/mover/MoverRequestList";
import { useDebounce } from "@/hooks/useDebounce";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMoverRequests } from "@/hooks/useMoverRequests";

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

  const { requests, isPending, error } = useMoverRequests({
    ...filters,
    search: debouncedKeyword.trim() || undefined,
  });

  const headerSize = isPc ? "lg" : isTabletUp ? "md" : "sm";

  const openFilterModal = () => {
    setDraftFilters(filters);
    setIsFilterOpen(true);
  };

  const applyDraft = () => {
    setFilters(draftFilters);
    setIsFilterOpen(false);
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

          <div className="tablet:mt-8 pc:mt-7 mt-4 flex flex-1 flex-col">
            {error ? (
              <Message>요청을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Message>
            ) : isPending ? (
              <Loading />
            ) : requests.length === 0 ? (
              <Message>조건에 맞는 요청이 없어요.</Message>
            ) : (
              <MoverRequestList requests={requests} />
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
    </div>
  );
}
