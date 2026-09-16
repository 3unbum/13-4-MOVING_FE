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

  remove: (moverIds: number[]) =>
    cookieFetch<BulkDeleteResult>("/favorites", {
      method: "DELETE",
      body: JSON.stringify({ moverIds }),
    }),
};
