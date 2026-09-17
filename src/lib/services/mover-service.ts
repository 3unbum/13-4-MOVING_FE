import { ApiError } from "@/lib/utils/api-error";
import { defaultFetch } from "@/lib/utils/api-client";

/** BE `mover.type.ts` MoverListSort와 동일 */
export type MoverListSort = "review" | "rating" | "career" | "confirmed";

/** GET /movers 한 행 — BE `MoverListItemResponse` */
export interface MoverListItem {
  id: number;
  nickName: string;
  image: string | null;
  career: number;
  bio: string;
  description: string;
  avgRating: number;
  reviewCount: number;
  confirmedCount: number;
  favoriteCount: number;
  services: string[];
  regions: string[];
}

/**
 * 목록 API는 `{ data, nextCursor, hasNext }`를 루트에 둔다.
 * cookieFetch/defaultFetch의 `json.data`만 반환하는 파싱과 달라 별도 fetch를 쓴다.
 */
export interface MoverListResponse {
  data: MoverListItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface GetMoverListParams {
  keyword?: string;
  /** 한글 지역 라벨 (예: 서울) — Filter UI 코드가 아님 */
  region?: string;
  /** 한글 서비스 라벨 (예: 소형이사) */
  service?: string;
  sort?: MoverListSort;
  /** 직전 응답 nextCursor. 없으면 첫 페이지 */
  cursor?: string;
  limit?: number;
}

export interface MoverReviewItem {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  customerName: string;
}

/** GET /movers/:id/reviews — offset/limit. page/totalPages가 루트에 있어 json.data만 쓰면 잘린다. */
export interface MoverReviewsResult {
  data: MoverReviewItem[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface MoverRatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  totalCount: number;
}

/** 쿼리 스트링 조립 — undefined/빈 값은 보내지 않음 */
function buildMoverListPath(params: GetMoverListParams): string {
  const searchParams = new URLSearchParams();

  if (params.keyword) {
    searchParams.set("keyword", params.keyword);
  }
  if (params.region) {
    searchParams.set("region", params.region);
  }
  if (params.service) {
    searchParams.set("service", params.service);
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }
  if (params.limit != null) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return query ? `/movers?${query}` : "/movers";
}

/** 공개 API — `{ data }` 래퍼가 없는 응답용 */
async function fetchPublicJson<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
  });

  const json: unknown = await res.json();

  if (!res.ok) {
    const raw =
      typeof json === "object" && json !== null && "error" in json
        ? (json as { error: { code?: string; message?: string } }).error
        : undefined;
    throw new ApiError(res.status, {
      code: raw?.code ?? "UNKNOWN",
      message: raw?.message ?? "요청에 실패했습니다",
    });
  }
  return json as T;
}

export const moverService = {
  getList: (params: GetMoverListParams) =>
    fetchPublicJson<MoverListResponse>(buildMoverListPath(params)),
  getReviews: (moverId: number, offset = 0, limit = 5) =>
    fetchPublicJson<MoverReviewsResult>(
      `/movers/${moverId}/reviews?offset=${offset}&limit=${limit}`
    ),
  getReviewDistribution: (moverId: number) =>
    defaultFetch<MoverRatingDistribution>(`/movers/${moverId}/reviews/distribution`),
};
