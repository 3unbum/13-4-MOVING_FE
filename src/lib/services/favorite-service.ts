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
}

export const favoriteQueryKeys = {
  all: ["favorites"] as const,
  list: () => ["favorites", "list"] as const,
};

export const favoriteService = {
  /** limit 없이 호출하면 찜한 기사님 전체를 받는다. BE limit는 찾기 PC 좌측 3명용. */
  list: () => cookieFetch<FavoriteListResult>("/favorites"),
  bulkDelete: (moverIds: number[]) =>
    cookieFetch<BulkDeleteResult>("/favorites", {
      method: "DELETE",
      body: JSON.stringify({ moverIds }),
    }),
};
