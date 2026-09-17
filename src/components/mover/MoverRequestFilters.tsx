"use client";

import CheckboxButton from "@/components/common/CheckboxButton";
import FilterButton from "@/components/common/FilterButton";
import InputSearchbar from "@/components/common/InputSearchbar";
import Sort from "@/components/common/Sort";
import Chip, { SERVICES, SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";
import type { MoverRequestSort } from "@/lib/services/mover-request-service";

/** 피그마 드롭다운 2종 — BE의 `targetedAt`(지정받은 시점순)은 화면에 없습니다 */
const SORT_OPTIONS = [
  { value: "latest", label: "요청일 빠른순" },
  { value: "movingDate", label: "이사 빠른순" },
];

export interface MoverRequestFilterState {
  category?: ServiceCode;
  isTargeted: boolean;
  isServiceRegion: boolean;
  sort: MoverRequestSort;
}

interface MoverRequestFiltersProps {
  filters: MoverRequestFilterState;
  onChange: (next: MoverRequestFilterState) => void;
  /** 검색어는 입력 즉시 반영하고 API 호출만 디바운스해서, 부모가 따로 들고 있습니다 */
  keyword: string;
  onKeywordChange: (value: string) => void;
  /** 결과 건수 — "전체 8건" */
  totalCount: number;
  /** 모바일·태블릿 필터 버튼 클릭 (바텀시트 열기) */
  onOpenFilterModal: () => void;
}

/**
 * 받은 요청 검색·필터·정렬 줄.
 *
 * PC는 칩·체크박스가 화면에 그대로 있고(`1:10435`), 태블릿·모바일은 필터 버튼으로
 * 바텀시트를 엽니다(`1:10531` / `1:10360`). 태블릿이 PC가 아니라 모바일을 따릅니다.
 *
 * 검색은 고객 이름 부분 일치입니다(BE #88). 입력은 즉시 반영하고 API 호출만
 * 디바운스하므로, 검색어 상태는 부모가 들고 있습니다.
 */
export default function MoverRequestFilters({
  filters,
  onChange,
  keyword,
  onKeywordChange,
  totalCount,
  onOpenFilterModal,
}: MoverRequestFiltersProps) {
  const patch = (next: Partial<MoverRequestFilterState>) => onChange({ ...filters, ...next });

  return (
    <div className="flex w-full flex-col">
      {/* 검색창 — 피그마 PC 64 / 태블릿·모바일 52 */}
      <InputSearchbar
        size="md"
        value={keyword}
        onChange={onKeywordChange}
        placeholder="어떤 고객님을 찾고 계세요?"
        label="고객 이름 검색"
        // 피그마(`1:10437`)는 배경이 background-200이고 높이가 PC 64 / 그 외 52입니다.
        // 컴포넌트 기본값은 background-100이라 값 기준으로 덮어씁니다.
        className="bg-background-200 pc:h-16 h-13"
      />

      {/* 이사 유형 칩 — PC만 (태블릿·모바일은 바텀시트 안에 있습니다) */}
      <div className="pc:flex mt-6 hidden items-center gap-3">
        {SERVICES.map((service) => (
          <Chip
            key={service}
            size="md"
            selected={filters.category === service}
            // 같은 칩을 다시 누르면 해제 — 피그마에 "전체" 칩이 따로 없습니다
            onClick={() => patch({ category: filters.category === service ? undefined : service })}
          >
            {SERVICE_LABELS[service]}
          </Chip>
        ))}
      </div>

      <p className="text-14 text-black-black-400 pc:text-16 pc:mt-10 mt-4 font-medium">
        전체 <span className="text-orange-400">{totalCount}건</span>
      </p>

      <div className="pc:mt-3 mt-1 flex w-full items-center justify-between">
        {/* 체크박스 2종 — PC만 */}
        <div className="pc:flex hidden items-center gap-9">
          <label className="group text-16 text-black-black-400 flex cursor-pointer items-center gap-2 font-medium">
            <CheckboxButton
              checked={filters.isTargeted}
              onChange={(e) => patch({ isTargeted: e.target.checked })}
            />
            지정 견적 요청
          </label>
          <label className="group text-16 text-black-black-400 flex cursor-pointer items-center gap-2 font-medium">
            <CheckboxButton
              checked={filters.isServiceRegion}
              onChange={(e) => patch({ isServiceRegion: e.target.checked })}
            />
            서비스 가능 지역
          </label>
        </div>

        {/* 태블릿·모바일은 정렬 옆에 필터 버튼이 붙습니다 */}
        <div className="pc:ml-auto flex items-center gap-1">
          <Sort
            size="md"
            label="정렬"
            options={SORT_OPTIONS}
            value={filters.sort}
            onChange={(value) => patch({ sort: value as MoverRequestSort })}
          />
          <div className="pc:hidden">
            <FilterButton
              active={
                filters.category !== undefined || filters.isTargeted || filters.isServiceRegion
              }
              onClick={onOpenFilterModal}
              aria-label="필터 열기"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
