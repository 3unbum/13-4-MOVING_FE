import { cookieFetch } from "@/lib/utils/api-client";

export interface ReviewMoverSummary {
  id: number;
  nickName: string;
  image: string | null;
}

export interface ReviewMovingInfo {
  movingDate: string;
  fromAddress: string;
  toAddress: string;
  category: string;
}

/** 리뷰당 사진 상한. BE와 같다. */
export const MAX_REVIEW_IMAGES = 3;

export interface WritableReviewItem {
  id: number;
  mover: ReviewMoverSummary;
  moving: ReviewMovingInfo;
  imageUrls: string[];
}

export interface WrittenReviewItem {
  id: number;
  rating: number;
  comment: string;
  mover: ReviewMoverSummary;
  moving: ReviewMovingInfo;
  createdAt: string;
  editedAt: string | null;
  imageUrls: string[];
}

export interface ReviewListResult<T> {
  items: T[];
  nextCursor: number | null;
}

export interface ReviewListQuery {
  cursor?: number;
  take?: number;
}

export const reviewQueryKeys = {
  all: ["reviews"] as const,
  writable: (page: number, cursor?: number) => ["reviews", "writable", page, cursor] as const,
  written: (page: number, cursor?: number) => ["reviews", "written", page, cursor] as const,
};

function toQueryString({ cursor, take }: ReviewListQuery) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", String(cursor));
  if (take) params.set("take", String(take));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export interface ConfirmReviewInput {
  rating: number;
  comment: string;
}

export const reviewService = {
  listWritable: (query: ReviewListQuery = {}) =>
    cookieFetch<ReviewListResult<WritableReviewItem>>(`/reviews/writable${toQueryString(query)}`),
  listWritten: (query: ReviewListQuery = {}) =>
    cookieFetch<ReviewListResult<WrittenReviewItem>>(`/reviews/my${toQueryString(query)}`),
  confirm: (id: number, body: ConfirmReviewInput, signal?: AbortSignal) =>
    cookieFetch(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify(body), signal }),

  /** PENDING 리뷰에 사진 한 장. 이미 3장이면 400. */
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return cookieFetch<{ imageUrl: string }>(`/reviews/${id}/images`, {
      method: "POST",
      body: formData,
    });
  },

  /** PENDING일 때만 삭제된다. */
  removeImage: (id: number, imageUrl: string) =>
    cookieFetch<void>(`/reviews/${id}/images`, {
      method: "DELETE",
      body: JSON.stringify({ imageUrl }),
    }),
};
