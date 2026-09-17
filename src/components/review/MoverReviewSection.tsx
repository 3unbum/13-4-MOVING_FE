"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Pagination from "@/components/common/Pagination";
import ProgressBar from "@/components/common/ProgressBar";
import CardReview from "@/components/review/CardReview";
import { moverQueryKeys } from "@/constants/query-keys/movers";
import { moverService, type MoverRatingDistribution } from "@/lib/services/mover-service";
import { cn } from "@/lib/utils/cn";

const TAKE = 5;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

interface MoverReviewSectionProps {
  /** 기사님 userId. 없으면 아무것도 그리지 않는다. */
  moverId: number | null | undefined;
  className?: string;
}

function formatCreatedAt(iso: string) {
  const kst = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** CardReview는 마스킹된 작성자를 받는다. */
function maskWriter(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "****";
  return `${trimmed.slice(0, 1)}****`;
}

function toProgressBarData(distribution: MoverRatingDistribution) {
  return {
    "1": distribution[1],
    "2": distribution[2],
    "3": distribution[3],
    "4": distribution[4],
    "5": distribution[5],
    totalCount: distribution.totalCount,
  };
}

/**
 * 기사님이 받은 리뷰 블록. 분포 + 목록 + 페이지네이션까지 포함.
 * 폭은 부모가 정함 (`w-full`).
 *
 * 마이페이지: <MoverReviewSection moverId={account.userId} />
 * 기사님 상세: <MoverReviewSection moverId={moverId} />
 */
export default function MoverReviewSection({ moverId, className }: MoverReviewSectionProps) {
  const [offset, setOffset] = useState(0);
  const enabled = moverId != null;

  const listQuery = useQuery({
    queryKey: moverQueryKeys.reviewList(moverId ?? 0, offset),
    queryFn: () => moverService.getReviews(moverId!, offset, TAKE),
    enabled,
    placeholderData: keepPreviousData,
  });

  const distributionQuery = useQuery({
    queryKey: moverQueryKeys.reviewDistribution(moverId ?? 0),
    queryFn: () => moverService.getReviewDistribution(moverId!),
    enabled,
  });

  if (!enabled) return null;

  if (listQuery.isPending && !listQuery.data) {
    return (
      <div
        className={cn("text-16 text-gray-gray-400 min-h-[200px] py-20 text-center", className)}
        role="status"
      >
        리뷰를 불러오는 중이에요.
      </div>
    );
  }

  if (listQuery.isError || distributionQuery.isError) {
    return (
      <p className={cn("text-16 text-gray-gray-400 py-20 text-center", className)}>
        리뷰를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  const items = listQuery.data?.data ?? [];
  const totalPages = listQuery.data?.totalPages ?? 0;
  const isEmpty = (listQuery.data?.totalCount ?? 0) === 0;
  const distribution = distributionQuery.data;

  if (isEmpty) {
    return (
      <div className={cn("flex w-full flex-col", className)}>
        <h2 className="text-16 tablet:text-20 text-black-black-400 font-semibold">리뷰</h2>
        <div className="flex flex-col items-center py-6 text-center">
          <p className="text-16 text-black-500 leading-7 font-semibold">
            아직 등록된 리뷰가 없어요!
          </p>
          <p className="text-14 text-gray-gray-400 leading-7">가장 먼저 리뷰를 등록해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div className="flex flex-col gap-4">
        {distribution ? <ProgressBar data={toProgressBarData(distribution)} /> : null}

        <ul className="divide-line-100 flex w-full flex-col divide-y">
          {items.map((item) => (
            <li key={item.id}>
              <CardReview
                size="lg"
                writer={maskWriter(item.customerName)}
                createdAt={formatCreatedAt(item.createdAt)}
                rating={item.rating}
                content={item.comment}
              />
            </li>
          ))}
        </ul>
      </div>

      <Pagination
        currentPage={offset / TAKE + 1}
        totalPages={totalPages}
        onPageChange={(nextPage) => setOffset((nextPage - 1) * TAKE)}
        className="mt-8 justify-center"
      />
    </div>
  );
}
