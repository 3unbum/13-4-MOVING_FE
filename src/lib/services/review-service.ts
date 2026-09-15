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

export interface WritableReviewItem {
  id: number;
  mover: ReviewMoverSummary;
  moving: ReviewMovingInfo;
}

export interface WrittenReviewItem {
  id: number;
  rating: number;
  comment: string;
  mover: ReviewMoverSummary;
  moving: ReviewMovingInfo;
  createdAt: string;
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

export const reviewService = {
  listWritable: (query: ReviewListQuery = {}) =>
    cookieFetch<ReviewListResult<WritableReviewItem>>(`/reviews/writable${toQueryString(query)}`),
  listWritten: (query: ReviewListQuery = {}) =>
    cookieFetch<ReviewListResult<WrittenReviewItem>>(`/reviews/my${toQueryString(query)}`),
};
