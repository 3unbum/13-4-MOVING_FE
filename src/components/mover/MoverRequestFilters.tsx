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

/** 이미 있으면 빼고 없으면 넣습니다 — 칩·바텀시트가 같은 규칙을 씁니다 */
export function toggleCategory(categories: ServiceCode[], service: ServiceCode) {
  return categories.includes(service)
    ? categories.filter((item) => item !== service)
    : [...categories, service];
}

export interface MoverRequestFilterState {
  /** 이사 유형 — 중복 선택 (빈 배열은 "전체") */
  categories: ServiceCode[];
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
            selected={filters.categories.includes(service)}
            // 여러 개를 동시에 켤 수 있고, 켜진 칩을 다시 누르면 꺼집니다
            // (피그마 `1:10577`에 소형이사·가정이사가 함께 선택된 상태가 있습니다)
            onClick={() => patch({ categories: toggleCategory(filters.categories, service) })}
          >
            {SERVICE_LABELS[service]}
          </Chip>
        ))}
      </div>

      {/* 태블릿·모바일은 "전체 N건"과 정렬이 한 줄입니다 (피그마 `Frame 2610421`, h=32).
          PC만 "전체 N건" 아래에 체크박스·정렬 줄이 따로 옵니다.
          위 간격은 피그마 기준 모바일 16 / 태블릿 28 / PC는 칩 아래 40. */}
      {/* 공용 Sort가 피그마(32)보다 8px 높은데 items-center로 두면 "전체 N건"이
          그 절반만큼 내려갑니다 — 피그마는 둘 다 같은 y에서 시작합니다 */}
      <div className="tablet:mt-7 pc:mt-10 pc:block mt-4 flex w-full items-start justify-between">
        <p className="text-14 text-black-black-400 pc:text-16 font-medium">
          전체 <span className="text-orange-400">{totalCount}건</span>
        </p>

        <div className="pc:mt-3 pc:w-full flex items-center justify-between">
          {/* 체크박스 2종 — PC만 */}
          <div className="pc:flex hidden items-center gap-9">
            <label className="group text-16 text-black-black-400 flex cursor-pointer items-center gap-2 font-medium">
              <CheckboxButton
                shape="square"
                checked={filters.isTargeted}
                onChange={(e) => patch({ isTargeted: e.target.checked })}
              />
              지정 견적 요청
            </label>
            <label className="group text-16 text-black-black-400 flex cursor-pointer items-center gap-2 font-medium">
              <CheckboxButton
                shape="square"
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
                  filters.categories.length > 0 || filters.isTargeted || filters.isServiceRegion
                }
                onClick={onOpenFilterModal}
                aria-label="필터 열기"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
