"use client";

import { useQuery } from "@tanstack/react-query";
import { moverQueryKeys } from "@/constants/query-keys/movers";
import { moverService } from "@/lib/services/mover-service";
import { useAuth } from "@/providers/AuthProvider";

/** GET /movers/:id — optionalAuth로 쿠키 있을 때 isFavorited·isTargeted 포함 */
export function useMoverDetail(moverId: number) {
  const { account } = useAuth();

  return useQuery({
    queryKey: moverQueryKeys.detailByAuth(moverId, account?.userId ?? null),
    queryFn: () => moverService.getById(moverId),
    enabled: Number.isFinite(moverId) && moverId > 0,
  });
}
