import { cookieFetch } from "@/lib/utils/api-client";

export interface FavoriteMoverCard {
  id: number;
  nickName: string;
  bio: string;
  image: string | null;
  career: number;
  avgRating: number;
  reviewCount: number;
  confirmedCount: number;
  favoriteCount: number;
  services: string[];
  regions: string[];
}

export interface FavoriteListResult {
  items: FavoriteMoverCard[];
  total: number;
}

export interface BulkDeleteResult {
  deletedCount: number;
  deletedMoverIds: number[];
  /** 50개 단위 요청 중 일부가 실패한 경우 */
  incomplete?: boolean;
}

/** BE bulkDelete는 요청당 최대 50명 */
const BULK_DELETE_MAX = 50;

async function removeInChunks(moverIds: number[]): Promise<BulkDeleteResult> {
  const uniqueIds = [...new Set(moverIds)];
  if (uniqueIds.length === 0) {
    return { deletedCount: 0, deletedMoverIds: [] };
  }

  const deletedMoverIds: number[] = [];
  let lastError: unknown;

  for (let index = 0; index < uniqueIds.length; index += BULK_DELETE_MAX) {
    const batch = uniqueIds.slice(index, index + BULK_DELETE_MAX);
    try {
      const result = await cookieFetch<BulkDeleteResult>("/favorites", {
        method: "DELETE",
        body: JSON.stringify({ moverIds: batch }),
      });
      deletedMoverIds.push(...result.deletedMoverIds);
    } catch (error) {
      lastError = error;
      break;
    }
  }

  if (deletedMoverIds.length === 0) {
    throw lastError instanceof Error
      ? lastError
      : new Error("찜 해제에 실패했어요. 다시 시도해 주세요.");
  }

  return {
    deletedCount: deletedMoverIds.length,
    deletedMoverIds,
    incomplete: lastError != null,
  };
}

/**
 * 찜 API — requireAuth + CUSTOMER.
 * cookieFetch로 쿠키·401 refresh를 태운다.
 */
export const favoriteService = {
  /** limit 없으면 전체(하트 상태용), 있으면 최신 N명(사이드바, 최대 3) */
  list: (limit?: number) => {
    const path = limit != null ? `/favorites?limit=${limit}` : "/favorites";
    return cookieFetch<FavoriteListResult>(path);
  },

  create: (moverId: number) =>
    cookieFetch<FavoriteMoverCard>("/favorites", {
      method: "POST",
      body: JSON.stringify({ moverId }),
    }),

  remove: removeInChunks,
};
