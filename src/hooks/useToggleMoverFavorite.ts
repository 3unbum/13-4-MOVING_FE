"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { favoriteQueryKeys } from "@/constants/query-keys/favorites";
import { moverQueryKeys } from "@/constants/query-keys/movers";
import { favoriteService, type FavoriteListResult } from "@/lib/services/favorite-service";
import { useAuth } from "@/providers/AuthProvider";

type ToggleArgs = {
  moverId: number;
  isFavorited: boolean;
  currentCount: number;
};

/**
 * 목록·사이드바 공통 찜 토글.
 * - CUSTOMER: POST/DELETE /favorites
 * - 비회원: onRequireLogin (모달 → 로그인)
 * - 기사님 계정: API 미호출
 *
 * 목록 API에 isFavorited가 없어 GET /favorites 전체로 ID Set을 만든다.
 */
export function useToggleMoverFavorite(options?: { onRequireLogin?: () => void }) {
  const queryClient = useQueryClient();
  const { account, isAuthenticated } = useAuth();
  const isCustomer = isAuthenticated && account?.role === "CUSTOMER";

  // 목록 refetch 전 favoriteCount 즉시 반영용
  const [favoriteCountById, setFavoriteCountById] = useState<Record<number, number>>({});
  // 같은 기사님만 중복 클릭 막고, 다른 기사님은 병렬 토글 가능
  const [pendingMoverIds, setPendingMoverIds] = useState<Set<number>>(() => new Set());
  // setState는 비동기라 연타 가드는 ref로 동기 체크
  const pendingMoverIdsRef = useRef<Set<number>>(new Set());

  const markPending = (moverId: number) => {
    pendingMoverIdsRef.current.add(moverId);
    setPendingMoverIds(new Set(pendingMoverIdsRef.current));
  };

  const clearPending = (moverId: number) => {
    pendingMoverIdsRef.current.delete(moverId);
    setPendingMoverIds(new Set(pendingMoverIdsRef.current));
  };

  // ── 내가 찜한 기사님 전체 (하트 filled 여부) ──
  const favoritesQuery = useQuery({
    queryKey: favoriteQueryKeys.list(),
    queryFn: () => favoriteService.list(),
    enabled: isCustomer,
  });

  const favoritedIds = new Set(favoritesQuery.data?.items.map((item) => item.id) ?? []);

  const mutation = useMutation({
    mutationFn: async ({ moverId, isFavorited, currentCount }: ToggleArgs) => {
      if (isFavorited) {
        await favoriteService.remove([moverId]);
        return {
          moverId,
          nextFavorited: false as const,
          favoriteCount: Math.max(0, currentCount - 1),
        };
      }
      const card = await favoriteService.create(moverId);
      return {
        moverId,
        nextFavorited: true as const,
        favoriteCount: card.favoriteCount,
      };
    },

    // 응답 전에 하트 UI를 먼저 뒤집음 (실패 시 onError에서 롤백)
    onMutate: async ({ moverId, isFavorited, currentCount }) => {
      await queryClient.cancelQueries({ queryKey: favoriteQueryKeys.all });

      const previousAll = queryClient.getQueryData<FavoriteListResult>(favoriteQueryKeys.list());

      if (previousAll) {
        const nextItems = isFavorited
          ? previousAll.items.filter((item) => item.id !== moverId)
          : [
              ...previousAll.items.filter((item) => item.id !== moverId),
              // create 직후엔 카드 전체가 없어도 id만 있으면 favoritedIds에 포함됨
              {
                id: moverId,
                nickName: "",
                bio: "",
                image: null,
                career: 0,
                avgRating: 0,
                reviewCount: 0,
                confirmedCount: 0,
                favoriteCount: currentCount + 1,
                services: [],
                regions: [],
              },
            ];
        queryClient.setQueryData<FavoriteListResult>(favoriteQueryKeys.list(), {
          items: nextItems,
          total: nextItems.length,
        });
      }

      return { previousAll };
    },

    onError: (_error, _vars, context) => {
      if (context?.previousAll) {
        queryClient.setQueryData(favoriteQueryKeys.list(), context.previousAll);
      }
    },

    onSuccess: (result) => {
      setFavoriteCountById((prev) => ({
        ...prev,
        [result.moverId]: result.favoriteCount,
      }));
    },

    // 전체·사이드바(limit=3)·상세 캐시 갱신 + 해당 ID pending 해제
    onSettled: (_data, _error, variables) => {
      clearPending(variables.moverId);
      void queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: moverQueryKeys.detail(variables.moverId),
      });
    },
  });

  // 찜 ID Set 확정 전 토글 시 create/remove가 뒤바뀔 수 있음
  const isFavoritesLoading = isCustomer && favoritesQuery.isPending;

  const toggleFavorite = (moverId: number, currentCount: number) => {
    if (!isAuthenticated) {
      options?.onRequireLogin?.();
      return;
    }
    if (!isCustomer || isFavoritesLoading || pendingMoverIdsRef.current.has(moverId)) {
      return;
    }
    markPending(moverId);
    mutation.mutate({
      moverId,
      isFavorited: favoritedIds.has(moverId),
      currentCount,
    });
  };

  const getFavoriteCount = (moverId: number, baseCount: number) =>
    favoriteCountById[moverId] ?? baseCount;

  return {
    isCustomer,
    favoritedIds,
    isFavoritesLoading,
    toggleFavorite,
    getFavoriteCount,
    isToggling: (moverId: number) => pendingMoverIds.has(moverId),
  };
}
