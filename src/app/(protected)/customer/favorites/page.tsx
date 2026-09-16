"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import CheckboxButton from "@/components/common/CheckboxButton";
import Header from "@/components/common/Header";
import Toast from "@/components/common/Toast";
import { SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";
import CardMover from "@/components/mover/CardMover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { favoriteQueryKeys } from "@/constants/query-keys/favorites";
import { favoriteService } from "@/lib/services/favorite-service";
import { ApiError } from "@/lib/utils/api-error";
import { cn } from "@/lib/utils/cn";
import FavoritesEmptyFallback from "./_components/FavoritesEmptyFallback";

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

/** BE moverServices.service는 ServiceType. 유효한 값만 칩으로 쓴다. */
function toServiceCodes(services: string[]): ServiceCode[] {
  return services.filter((service): service is ServiceCode => service in SERVICE_LABELS);
}

export default function CustomerFavoritesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const isPc = useMediaQuery(PC_QUERY);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cardSize = isTabletUp ? "lg" : "md";
  const headerSize = isPc ? "lg" : isTabletUp ? "md" : "sm";

  const { data, isPending, isError } = useQuery({
    queryKey: favoriteQueryKeys.list(),
    queryFn: () => favoriteService.list(),
  });

  const items = data?.items ?? [];
  const isEmpty = !isPending && items.length === 0;
  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedCount === items.length;

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const deleteMutation = useMutation({
    mutationFn: (moverIds: number[]) => favoriteService.remove(moverIds),
    onSuccess: (result) => {
      const deleted = new Set(result.deletedMoverIds);
      setSelectedIds((current) => {
        const next = new Set(current);
        deleted.forEach((id) => next.delete(id));
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.all });
      if (result.incomplete) {
        showToast("일부만 해제됐어요. 다시 시도해 주세요.");
        return;
      }
      showToast(
        result.deletedCount > 1
          ? `찜한 기사님 ${result.deletedCount}명을 해제했어요`
          : "찜이 해제되었어요"
      );
    },
    onError: (error) => {
      showToast(
        error instanceof ApiError ? error.message : "찜 해제에 실패했어요. 다시 시도해 주세요."
      );
    },
  });

  const toggleOne = (moverId: number, selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(moverId);
      else next.delete(moverId);
      return next;
    });
  };

  const toggleAll = (selected: boolean) => {
    setSelectedIds(selected ? new Set(items.map((item) => item.id)) : new Set());
  };

  const handleDelete = (moverIds: number[]) => {
    if (moverIds.length === 0 || deleteMutation.isPending) return;
    deleteMutation.mutate(moverIds);
  };

  return (
    <div className="bg-background-background-100 pc:min-h-[calc(100dvh-88px)] flex min-h-[calc(100dvh-54px)] flex-1 flex-col">
      <Header size={headerSize}>찜한 기사님</Header>

      {isError ? (
        <p className="text-16 text-gray-gray-400 py-20 text-center">
          찜 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : isPending && !data ? null : isEmpty ? (
        <FavoritesEmptyFallback onFindMovers={() => router.push("/movers")} />
      ) : (
        <section className="tablet:px-18 pc:px-0 pc:pt-8 flex w-full flex-1 flex-col items-center px-6 pt-4 pb-10">
          <div className="tablet:max-w-[600px] pc:max-w-[1200px] pc:w-[1200px] flex w-full flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckboxButton
                  shape="square"
                  aria-label="전체 선택"
                  checked={allSelected}
                  onChange={(event) => toggleAll(event.target.checked)}
                />
                <span className="text-14 tablet:text-16 text-black-300">
                  전체선택({selectedCount}/{items.length})
                </span>
              </div>
              <button
                type="button"
                disabled={selectedCount === 0 || deleteMutation.isPending}
                onClick={() => handleDelete([...selectedIds])}
                className={cn(
                  "text-14 tablet:text-16 px-3",
                  selectedCount === 0
                    ? "text-gray-gray-400 cursor-not-allowed"
                    : "text-black-500 cursor-pointer hover:text-orange-400"
                )}
              >
                선택 항목 삭제
              </button>
            </div>

            <ul className="tablet:mt-5 pc:mt-7 mt-2.5 flex flex-col gap-5">
              {items.map((item) => (
                <li key={item.id}>
                  <CardMover
                    size={cardSize}
                    categories={toServiceCodes(item.services)}
                    title={item.bio}
                    nickName={item.nickName}
                    profileImage={item.image}
                    rating={item.avgRating}
                    reviewCount={item.reviewCount}
                    career={item.career}
                    confirmedCount={item.confirmedCount}
                    favoriteCount={item.favoriteCount}
                    isFavorited
                    selectable
                    selected={selectedIds.has(item.id)}
                    onSelectChange={(selected) => toggleOne(item.id, selected)}
                    onFavoriteClick={() => handleDelete([item.id])}
                    className="cursor-pointer"
                    aria-label={`${item.nickName} 기사님 상세 보기`}
                    tabIndex={0}
                    onClick={() => router.push(`/movers/${item.id}`)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/movers/${item.id}`);
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {toastMessage != null && <Toast message={toastMessage} size={isPc ? "md" : "sm"} />}
    </div>
  );
}
