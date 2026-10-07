import { cookieFetch, defaultFetch } from "@/lib/utils/api-client";
import { ApiError } from "@/lib/utils/api-error";

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
  imageUrls: string[];
}

export interface MoverReviewImageItem {
  reviewId: number;
  imageUrl: string;
}

/** 기사님 리뷰 정렬. 없으면 백엔드는 latest로 본다. */
export type MoverReviewSort = "oldest" | "latest" | "ratingDesc" | "ratingAsc";

export const MOVER_REVIEW_SORTS = [
  "oldest",
  "latest",
  "ratingDesc",
  "ratingAsc",
] as const satisfies readonly MoverReviewSort[];

export const DEFAULT_MOVER_REVIEW_SORT: MoverReviewSort = "latest";

/** GET /movers/:id/reviews — BE는 page(1-base). page/totalPages가 루트에 있어 json.data만 쓰면 잘린다. */
export interface MoverReviewsResult {
  data: MoverReviewItem[];
  page: number;
  totalPages: number;
  totalCount: number;
}

/** GET /movers/:id/reviews/images — 리뷰 목록과 같이 page/totalPages가 루트에 있다. */
export interface MoverReviewImagesResult {
  data: MoverReviewImageItem[];
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

/** GET /movers/:id — BE `MoverDetailResponse`. 로그인 CUSTOMER면 isFavorited·isTargeted 포함 */
export interface MoverDetail {
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
  /** 한글 라벨 (예: 소형이사) */
  services: string[];
  /** 한글 라벨 (예: 서울) */
  regions: string[];
  isFavorited?: boolean;
  isTargeted?: boolean;
}

export const moverService = {
  getList: (params: GetMoverListParams) =>
    fetchPublicJson<MoverListResponse>(buildMoverListPath(params)),

  /** optionalAuth — 쿠키 있으면 CUSTOMER 전용 필드 포함 */
  getById: (moverId: number) => cookieFetch<MoverDetail>(`/movers/${moverId}`),

  getReviews: (moverId: number, page = 1, limit = 5, sort?: MoverReviewSort) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (sort) params.set("sort", sort);
    return fetchPublicJson<MoverReviewsResult>(`/movers/${moverId}/reviews?${params.toString()}`);
  },

  getReviewDistribution: (moverId: number) =>
    defaultFetch<MoverRatingDistribution>(`/movers/${moverId}/reviews/distribution`),

  /** limit는 BE가 최대 5다. */
  getReviewImages: (moverId: number, page = 1, limit = 5) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return fetchPublicJson<MoverReviewImagesResult>(
      `/movers/${moverId}/reviews/images?${params.toString()}`
    );
  },
};

const REVIEW_IMAGE_PAGE_SIZE = 5;
/** 더보기 모달에 넣을 전체 목록. 페이지당 5장 제한이라 이 페이지까지만 모은다. */
const REVIEW_IMAGE_MAX_PAGES = 40;

/** 확정 리뷰 사진을 최신 리뷰 순으로 모은다. */
export async function getReviewImageGallery(moverId: number): Promise<{
  items: MoverReviewImageItem[];
  totalCount: number;
}> {
  const first = await moverService.getReviewImages(moverId, 1, REVIEW_IMAGE_PAGE_SIZE);
  const items = [...first.data];
  const pages = Math.min(first.totalPages, REVIEW_IMAGE_MAX_PAGES);

  for (let page = 2; page <= pages; page += 1) {
    const next = await moverService.getReviewImages(moverId, page, REVIEW_IMAGE_PAGE_SIZE);
    items.push(...next.data);
  }

  return { items, totalCount: first.totalCount };
}

/** 사진의 reviewId로 리뷰 본문을 찾는다. 정렬과 무관하게 최신순 페이지를 훑는다. */
export async function findMoverReview(
  moverId: number,
  reviewId: number
): Promise<MoverReviewItem | null> {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= 30) {
    const result = await moverService.getReviews(moverId, page, REVIEW_IMAGE_PAGE_SIZE, "latest");
    const found = result.data.find((item) => item.id === reviewId);
    if (found) return found;
    totalPages = result.totalPages;
    page += 1;
  }

  return null;
}
