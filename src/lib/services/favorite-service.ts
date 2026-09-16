import { cookieFetch } from "@/lib/utils/api-client";

export interface FavoriteMoverCard {
  id: number;
  nickName: string;
  bio: string;
  image: string | null;
  avgRating: number;
  reviewCount: number;
  career: number;
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

export const favoriteQueryKeys = {
  all: ["favorites"] as const,
  list: () => ["favorites", "list"] as const,
};

export const favoriteService = {
  /** limit 없이 호출하면 찜한 기사님 전체를 받는다. BE limit는 찾기 PC 좌측 3명용. */
  list: () => cookieFetch<FavoriteListResult>("/favorites"),
  bulkDelete: async (moverIds: number[]): Promise<BulkDeleteResult> => {
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
  },
};
