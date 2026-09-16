"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoriteService } from "@/lib/services/favorite-service";

export const favoriteKeys = {
  list: ["favorites"] as const,
};

/**
 * 기사님 찜 토글.
 *
 * 견적 응답에 `isFavorited`가 없어 찜 목록을 받아 대조합니다. 목록은 한 번 받으면
 * 여러 화면이 공유하므로 쿼리 캐시에 둡니다.
 *
 * 해제는 `favoriteService.remove`가 배열을 받습니다 — BE가 다중 해제만 지원해
 * 찜 목록 페이지가 그렇게 쓰고 있어, 단건도 배열로 감싸 보냅니다.
 */
export function useFavoriteMover(moverId: number) {
  const queryClient = useQueryClient();

  const favorites = useQuery({
    queryKey: favoriteKeys.list,
    queryFn: () => favoriteService.list(),
  });

  const isFavorited = (favorites.data?.items ?? []).some((mover) => mover.id === moverId);

  const toggle = useMutation({
    // 추가/해제 응답 형태가 달라 반환값은 쓰지 않습니다 — 목록 무효화로 상태를 맞춥니다
    mutationFn: async () => {
      if (isFavorited) await favoriteService.remove([moverId]);
      else await favoriteService.create(moverId);
    },
    // 목록이 갱신돼야 하트 상태가 바뀝니다. 찜 수가 함께 바뀌므로 견적 캐시도 비웁니다.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: favoriteKeys.list }),
        queryClient.invalidateQueries({ queryKey: ["estimates"] }),
      ]),
  });

  return {
    isFavorited,
    toggle: () => toggle.mutate(),
    isToggling: toggle.isPending,
    error: toggle.error,
  };
}
