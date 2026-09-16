"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Filter from "@/components/common/Filter";
import Header from "@/components/common/Header";
import InputSearchbar from "@/components/common/InputSearchbar";
import Sort from "@/components/common/Sort";
import CardMover from "@/components/mover/CardMover";
import InfoRequiredModal from "@/components/quote/InfoRequiredModal";
import {
  DEFAULT_MOVER_FILTERS,
  REGION_COLUMNS,
  SERVICE_OPTIONS,
  SORT_OPTIONS,
} from "@/constants/movers/filters";
import type { MoverListFilters } from "@/constants/query-keys/movers";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";
import { useMoversInfinite } from "@/hooks/useMoversInfinite";
import { useSidebarFavorites } from "@/hooks/useSidebarFavorites";
import { useToggleMoverFavorite } from "@/hooks/useToggleMoverFavorite";
import type { MoverListSort } from "@/lib/services/mover-service";
import { toMoverListRegionParam, toMoverListServiceParam } from "@/lib/utils/mover-filter-params";
import { mapFavoriteCardToCard, mapMoverListItemToCard } from "@/lib/utils/mover-list-mapper";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";

type MoverCardViewModel = ReturnType<typeof mapMoverListItemToCard>;

function getMoverCardNavProps(onNavigate: () => void) {
  return {
    role: "link" as const,
    tabIndex: 0,
    onClick: onNavigate,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onNavigate();
      }
    },
  };
}

function ResponsiveMoverCard({
  mover,
  isFavorited,
  onFavoriteClick,
  onNavigate,
}: {
  mover: MoverCardViewModel;
  isFavorited: boolean;
  onFavoriteClick: () => void;
  onNavigate: () => void;
}) {
  const shared = {
    category: mover.category,
    title: mover.title,
    description: mover.description,
    nickName: mover.nickName,
    profileImage: mover.profileImage,
    rating: mover.rating,
    reviewCount: mover.reviewCount,
    career: mover.career,
    confirmedCount: mover.confirmedCount,
    favoriteCount: mover.favoriteCount,
    isFavorited,
    onFavoriteClick,
    ...getMoverCardNavProps(onNavigate),
  };

  return (
    <>
      {/* Mobile 목록: Figma md(327×226) — bio+description / Tablet·PC: lg */}
      <CardMover {...shared} size="md" className="tablet:hidden cursor-pointer" />
      <CardMover {...shared} size="lg" className="tablet:block hidden cursor-pointer" />
    </>
  );
}

export default function MoversPage() {
  const router = useRouter();
  const { account, isAuthenticated } = useAuth();
  // 찜 API는 CUSTOMER 전용 — 사이드바·토글도 동일 기준
  const isCustomer = isAuthenticated && account?.role === "CUSTOMER";

  // ── UI 필터 state (코드값). API로 넘길 때만 한글 라벨로 변환 ──
  const [search, setSearch] = useState(DEFAULT_MOVER_FILTERS.search);
  const [region, setRegion] = useState(DEFAULT_MOVER_FILTERS.region);
  const [service, setService] = useState(DEFAULT_MOVER_FILTERS.service);
  const [sort, setSort] = useState<MoverListSort>(DEFAULT_MOVER_FILTERS.sort);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // 입력은 즉시 반영, API keyword만 300ms debounce
  const debouncedSearch = useDebounce(search, 300);
  const keywordForQuery = debouncedSearch.trim() || undefined;

  // queryKey에 포함 → 필터 바뀌면 목록을 처음부터 다시 fetch
  const listFilters: MoverListFilters = useMemo(
    () => ({
      keyword: keywordForQuery,
      region: toMoverListRegionParam(region),
      service: toMoverListServiceParam(service),
      sort,
    }),
    [keywordForQuery, region, service, sort]
  );

  // ── 서버 상태 ──
  const { favoritedIds, toggleFavorite, getFavoriteCount } = useToggleMoverFavorite({
    onRequireLogin: () => setLoginModalOpen(true),
  });

  const {
    data: sidebarFavorites,
    isPending: isSidebarPending,
    isError: isSidebarError,
  } = useSidebarFavorites();

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMoversInfinite(listFilters);

  // infinite query pages → 카드용 flat 배열
  const movers = useMemo(
    () => data?.pages.flatMap((page) => page.data.map(mapMoverListItemToCard)) ?? [],
    [data]
  );

  const sidebarMovers = useMemo(
    () => sidebarFavorites?.items.map(mapFavoriteCardToCard) ?? [],
    [sidebarFavorites]
  );

  // 목록 맨 아래 sentinel이 보이면 다음 커서 페이지 요청
  const sentinelRef = useInfiniteScrollTrigger(
    () => {
      void fetchNextPage();
    },
    { enabled: Boolean(hasNextPage), isLoading: isFetchingNextPage }
  );

  const resetFilters = () => {
    setSearch(DEFAULT_MOVER_FILTERS.search);
    setRegion(DEFAULT_MOVER_FILTERS.region);
    setService(DEFAULT_MOVER_FILTERS.service);
    setSort(DEFAULT_MOVER_FILTERS.sort);
  };

  const goToCustomerLogin = () => {
    setLoginModalOpen(false);
    router.push("/customer/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto w-full max-w-[1920px]">
        <Header size="lg" className="pc:flex hidden">
          기사님 찾기
        </Header>

        <main
          className={cn(
            "w-full flex-1",
            "px-6 pt-1.5 pb-10",
            "tablet:px-18 tablet:pt-2.5",
            "pc:px-90 pc:pt-0.75 pc:pb-20"
          )}
        >
          {/* ── 검색·필터·정렬 (PC 검색열 819px, 목록은 820px) ── */}
          <div className="pc:w-204.75">
            <div className="pc:pb-0 tablet:pb-2.5 pb-1.5">
              <InputSearchbar
                size="sm"
                className="pc:hidden"
                value={search}
                onChange={setSearch}
                label="기사님 별명 검색"
                placeholder="텍스트를 입력해 주세요."
              />
              <InputSearchbar
                size="md"
                className="pc:flex hidden"
                value={search}
                onChange={setSearch}
                label="기사님 별명 검색"
                placeholder="텍스트를 입력해 주세요."
              />
            </div>

            <div className={cn("flex items-center py-4", "pc:mt-9.5 pc:py-0")}>
              {/* Mobile 필터 간격 8px, Tablet 12px. 초기화는 PC만 (Figma) */}
              <div className="pc:hidden tablet:gap-3 flex items-center gap-2">
                <Filter
                  size="sm"
                  label="지역"
                  layout="double"
                  columns={REGION_COLUMNS}
                  value={region}
                  onChange={setRegion}
                />
                <Filter
                  size="sm"
                  label="서비스"
                  options={[...SERVICE_OPTIONS]}
                  value={service}
                  onChange={setService}
                />
              </div>
              <div className="pc:flex hidden items-center">
                <div className="flex items-center gap-3">
                  <Filter
                    size="md"
                    label="지역"
                    layout="double"
                    columns={REGION_COLUMNS}
                    value={region}
                    onChange={setRegion}
                  />
                  <Filter
                    size="md"
                    label="서비스"
                    options={[...SERVICE_OPTIONS]}
                    value={service}
                    onChange={setService}
                  />
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-16 text-gray-gray-300 ml-6.25 font-medium whitespace-nowrap"
                >
                  초기화
                </button>
              </div>

              <div className="ml-auto">
                <Sort
                  size="sm"
                  className="pc:hidden"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={(value) => setSort(value as MoverListSort)}
                />
                <Sort
                  size="md"
                  className="pc:inline-flex hidden"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={(value) => setSort(value as MoverListSort)}
                />
              </div>
            </div>
          </div>

          {/* ── 본문: 목록 + (PC) 찜 사이드바 ── */}
          <div className="tablet:mt-6 pc:mt-9.25 pc:gap-13.5 mt-3 flex items-start">
            <div className="pc:w-205 pc:flex-none flex min-w-0 flex-1 flex-col">
              {isPending && (
                <p className="text-14 text-gray-gray-500 py-8 text-center">
                  기사님 목록을 불러오는 중…
                </p>
              )}

              {isError && (
                <p className="text-14 py-8 text-center text-red-500" role="alert">
                  목록을 불러오지 못했습니다.
                  {error instanceof Error ? ` (${error.message})` : null}
                </p>
              )}

              {!isPending && !isError && movers.length === 0 && (
                <p className="text-14 text-gray-gray-500 py-8 text-center">
                  조건에 맞는 기사님이 없습니다.
                </p>
              )}

              <ul className="pc:gap-5 flex flex-col gap-6">
                {movers.map((mover) => {
                  // 토글 직후 개수는 목록 refetch 전이라 로컬 override 사용
                  const favoriteCount = getFavoriteCount(mover.id, mover.favoriteCount);
                  return (
                    <li key={mover.id}>
                      <ResponsiveMoverCard
                        mover={{ ...mover, favoriteCount }}
                        isFavorited={favoritedIds.has(mover.id)}
                        onFavoriteClick={() => toggleFavorite(mover.id, favoriteCount)}
                        onNavigate={() => router.push(`/movers/${mover.id}`)}
                      />
                    </li>
                  );
                })}
              </ul>

              {/* 뷰포트에 들어오면 fetchNextPage */}
              <div ref={sentinelRef} className="h-1 w-full shrink-0" aria-hidden />

              {isFetchingNextPage && (
                <p className="text-14 text-gray-gray-500 py-4 text-center">더 불러오는 중…</p>
              )}
            </div>

            {/* PC + CUSTOMER만 — GET /favorites?limit=3 */}
            {isCustomer && (
              <aside className="pc:flex hidden w-81.75 shrink-0 flex-col gap-4">
                <h2 className="text-20 text-black-black-450 font-semibold">찜한 기사님</h2>
                {isSidebarPending && <p className="text-14 text-gray-gray-500">불러오는 중…</p>}
                {isSidebarError && (
                  <p className="text-14 text-red-500" role="alert">
                    찜 목록을 불러오지 못했습니다.
                  </p>
                )}
                {!isSidebarPending && !isSidebarError && sidebarMovers.length === 0 && (
                  <p className="text-14 text-gray-gray-500">찜한 기사님이 없습니다.</p>
                )}
                <ul className="flex flex-col gap-4">
                  {sidebarMovers.map((mover) => {
                    const favoriteCount = getFavoriteCount(mover.id, mover.favoriteCount);
                    const navProps = getMoverCardNavProps(() => router.push(`/movers/${mover.id}`));
                    return (
                      <li key={mover.id}>
                        <CardMover
                          {...navProps}
                          size="sm"
                          className="cursor-pointer"
                          category={mover.category}
                          title={mover.title}
                          nickName={mover.nickName}
                          profileImage={mover.profileImage}
                          rating={mover.rating}
                          reviewCount={mover.reviewCount}
                          career={mover.career}
                          confirmedCount={mover.confirmedCount}
                          favoriteCount={favoriteCount}
                          isFavorited={favoritedIds.has(mover.id)}
                          onFavoriteClick={() => toggleFavorite(mover.id, favoriteCount)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </aside>
            )}
          </div>
        </main>
      </div>

      {/* 비회원 찜 가드 */}
      <InfoRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title="로그인이 필요합니다"
        message="찜하기는 로그인 후 이용할 수 있어요."
        actionLabel="로그인하기"
        onAction={goToCustomerLogin}
      />
    </div>
  );
}
