"use client";

import { useQuery } from "@tanstack/react-query";
import { SIDEBAR_FAVORITE_LIMIT } from "@/constants/movers/filters";
import { favoriteQueryKeys } from "@/constants/query-keys/favorites";
import { favoriteService } from "@/lib/services/favorite-service";
import { useAuth } from "@/providers/AuthProvider";

/**
 * PC 우측 「찜한 기사님」 사이드바.
 * BE limit 최대 3 · CUSTOMER만 호출 (비회원·기사님은 enabled=false)
 */
export function useSidebarFavorites() {
  const { account, isAuthenticated } = useAuth();
  const isCustomer = isAuthenticated && account?.role === "CUSTOMER";

  return useQuery({
    queryKey: favoriteQueryKeys.list(SIDEBAR_FAVORITE_LIMIT),
    queryFn: () => favoriteService.list(SIDEBAR_FAVORITE_LIMIT),
    enabled: isCustomer,
  });
}
