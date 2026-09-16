"use client";

import { useRef, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Pagination from "@/components/common/Pagination";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";
import Toast from "@/components/common/Toast";
import { SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";
import CardMyReview from "@/components/review/CardMyReview";
import CardWritableReview from "@/components/review/CardWritableReview";
import ReviewWriteModal from "@/components/review/ReviewWriteModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  reviewQueryKeys,
  reviewService,
  type WritableReviewItem,
} from "@/lib/services/review-service";
import { ApiError } from "@/lib/utils/api-error";
import { cn } from "@/lib/utils/cn";
import ReviewsEmptyFallback from "./_components/ReviewsEmptyFallback";

type ReviewTab = "writable" | "written";

const TAKE = 4;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

const TABS: { id: ReviewTab; label: string; panelId: string }[] = [
  { id: "writable", label: "작성 가능한 리뷰", panelId: "panel-writable" },
  { id: "written", label: "내가 작성한 리뷰", panelId: "panel-written" },
];

function toKst(iso: string) {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS);
}

function formatMovingDate(iso: string, withWeekday: boolean) {
  const kst = toKst(iso);
  const date = `${kst.getUTCFullYear()}년 ${String(kst.getUTCMonth() + 1).padStart(2, "0")}월 ${String(kst.getUTCDate()).padStart(2, "0")}일`;
  if (!withWeekday) return date;
  return `${date} (${WEEKDAYS[kst.getUTCDay()]})`;
}

function formatCreatedAt(iso: string) {
  const kst = toKst(iso);
  return `${kst.getUTCFullYear()}. ${String(kst.getUTCMonth() + 1).padStart(2, "0")}. ${String(kst.getUTCDate()).padStart(2, "0")}`;
}

function toServiceCode(category: string): ServiceCode {
  return category in SERVICE_LABELS ? (category as ServiceCode) : "SMALL";
}

export default function CustomerReviewsPage() {
  const queryClient = useQueryClient();
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const isPc = useMediaQuery(PC_QUERY);
  const [tab, setTab] = useState<ReviewTab>("writable");
  const [pageByTab, setPageByTab] = useState<Record<ReviewTab, number>>({
    writable: 1,
    written: 1,
  });
  const [cursorByTab, setCursorByTab] = useState<
    Record<ReviewTab, Record<number, number | undefined>>
  >({
    writable: { 1: undefined },
    written: { 1: undefined },
  });
  const [selected, setSelected] = useState<WritableReviewItem | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const submitAbortRef = useRef<AbortController | null>(null);

  const writablePage = pageByTab.writable;
  const writtenPage = pageByTab.written;
  const writableCursor = cursorByTab.writable[writablePage];
  const writtenCursor = cursorByTab.written[writtenPage];
  const writableSize = isPc ? "lg" : isTabletUp ? "md" : "sm";
  const writtenSize = isTabletUp ? "lg" : "sm";

  const writableQuery = useQuery({
    queryKey: reviewQueryKeys.writable(writablePage, writableCursor),
    queryFn: () => reviewService.listWritable({ cursor: writableCursor, take: TAKE }),
    placeholderData: keepPreviousData,
    enabled: tab === "writable",
  });
  const writtenQuery = useQuery({
    queryKey: reviewQueryKeys.written(writtenPage, writtenCursor),
    queryFn: () => reviewService.listWritten({ cursor: writtenCursor, take: TAKE }),
    placeholderData: keepPreviousData,
    enabled: tab === "written",
  });

  const activeQuery = tab === "writable" ? writableQuery : writtenQuery;
  const page = tab === "writable" ? writablePage : writtenPage;
  const { data, isPending, isError, isPlaceholderData } = activeQuery;

  const items = data?.items ?? [];
  const isEmpty = !isPending && items.length === 0;
  // BE는 커서 페이지라 totalCount가 없다. 지금까지 연 페이지 + 다음 커서 여부로 오프셋 UI를 구성한다.
  // keepPreviousData 구간에는 이전 페이지 nextCursor로 한 장을 더 열면 안 된다.
  const totalPages = !isPlaceholderData && data?.nextCursor ? page + 1 : Math.max(page, 1);

  const handlePageChange = (nextPage: number) => {
    // 다음 페이지 커서는 지금 응답의 nextCursor다. effect로 동기화하면 렌더가 한 번 더 돈다.
    if (nextPage === page + 1) {
      if (isPlaceholderData || !data?.nextCursor) return;
      setCursorByTab((current) => ({
        ...current,
        [tab]: { ...current[tab], [nextPage]: data.nextCursor },
      }));
    }
    setPageByTab((current) => ({ ...current, [tab]: nextPage }));
  };

  const closeWriteModal = () => {
    // 닫기는 제출 취소를 뜻한다. 진행 중인 PATCH는 버리고 성공/실패 토스트도 띄우지 않는다.
    submitAbortRef.current?.abort();
    submitAbortRef.current = null;
    setSelected(null);
    setRating(0);
    setComment("");
    setIsSubmitting(false);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmitReview = async () => {
    if (!selected || isSubmitting) return;
    const controller = new AbortController();
    submitAbortRef.current = controller;
    setIsSubmitting(true);
    try {
      await reviewService.confirm(
        selected.id,
        { rating, comment: comment.trim() },
        controller.signal
      );
      if (controller.signal.aborted) return;
      closeWriteModal();
      setPageByTab((current) => ({ ...current, writable: 1 }));
      setCursorByTab((current) => ({ ...current, writable: { 1: undefined } }));
      await queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });
      showToast("리뷰가 등록되었어요");
    } catch (error) {
      if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
        return;
      }
      showToast(
        error instanceof ApiError ? error.message : "리뷰 등록에 실패했어요. 다시 시도해 주세요."
      );
    } finally {
      if (submitAbortRef.current === controller) {
        submitAbortRef.current = null;
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-background-background-100 pc:min-h-[calc(100dvh-88px)] flex min-h-[calc(100dvh-54px)] flex-1 flex-col">
      <TabList aria-label="이사 리뷰 탭">
        {TABS.map((item) => (
          <Tab
            key={item.id}
            id={`tab-${item.id}`}
            controls={item.panelId}
            active={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Tab>
        ))}
      </TabList>

      <section
        id={tab === "writable" ? "panel-writable" : "panel-written"}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        aria-busy={isPending || isPlaceholderData}
        tabIndex={0}
        className={cn(
          "tablet:px-18 pc:px-0 flex w-full flex-1 flex-col items-center px-6",
          isEmpty
            ? "py-0"
            : cn("pc:pb-16 pt-10 pb-10", tab === "writable" ? "pc:pt-[54px]" : "pc:pt-[33px]")
        )}
      >
        {isError ? (
          <p className="text-16 text-gray-gray-400 py-20 text-center">
            리뷰를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : isPending && !data ? null : isEmpty ? (
          <ReviewsEmptyFallback
            message={
              tab === "writable" ? "작성 가능한 리뷰가 없어요!" : "아직 등록된 리뷰가 없어요!"
            }
            actionLabel={tab === "written" ? "리뷰 작성하러 가기" : undefined}
            onAction={tab === "written" ? () => setTab("writable") : undefined}
          />
        ) : (
          <div
            className={cn(
              "flex w-full flex-col",
              tab === "writable"
                ? "tablet:max-w-[600px] pc:max-w-[1120px] pc:w-[1120px]"
                : "tablet:max-w-[588px] pc:max-w-[1120px] pc:w-[1120px]"
            )}
          >
            <ul className="flex w-full flex-col gap-5">
              {tab === "writable"
                ? writableQuery.data?.items.map((item) => (
                    <li key={item.id}>
                      <CardWritableReview
                        size={writableSize}
                        category={toServiceCode(item.moving.category)}
                        nickName={item.mover.nickName}
                        profileImage={item.mover.image}
                        from={item.moving.fromAddress}
                        to={item.moving.toAddress}
                        movingDate={formatMovingDate(item.moving.movingDate, true)}
                        onWriteClick={() => {
                          setSelected(item);
                          setRating(0);
                          setComment("");
                        }}
                      />
                    </li>
                  ))
                : writtenQuery.data?.items.map((item) => (
                    <li key={item.id}>
                      <CardMyReview
                        size={writtenSize}
                        category={toServiceCode(item.moving.category)}
                        nickName={item.mover.nickName}
                        profileImage={item.mover.image}
                        from={item.moving.fromAddress}
                        to={item.moving.toAddress}
                        movingDate={formatMovingDate(item.moving.movingDate, writtenSize === "lg")}
                        rating={item.rating}
                        content={item.comment}
                        createdAt={formatCreatedAt(item.createdAt)}
                      />
                    </li>
                  ))}
            </ul>
            <div
              className={cn(
                "mt-10 flex justify-center",
                tab === "writable" ? "pc:mt-16" : "pc:mt-[88px]"
              )}
            >
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </section>
      {selected ? (
        <ReviewWriteModal
          open
          onClose={closeWriteModal}
          size={isPc ? "md" : "sm"}
          position={isTabletUp ? "center" : "bottom"}
          category={toServiceCode(selected.moving.category)}
          isTargeted={false}
          moverNickName={selected.mover.nickName}
          moverProfileImage={selected.mover.image}
          fromAddress={selected.moving.fromAddress}
          toAddress={selected.moving.toAddress}
          movingDate={formatMovingDate(selected.moving.movingDate, true)}
          rating={rating}
          onRatingChange={setRating}
          review={comment}
          onReviewChange={setComment}
          onSubmit={() => {
            void handleSubmitReview();
          }}
          isSubmitting={isSubmitting}
        />
      ) : null}
      {toastMessage ? <Toast message={toastMessage} /> : null}
    </div>
  );
}
