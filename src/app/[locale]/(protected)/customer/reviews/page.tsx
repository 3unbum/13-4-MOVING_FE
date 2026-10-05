"use client";

import { useRef, useState } from "react";
import { formatMovingDate, formatWrittenDate, type DateLocale } from "@/lib/utils/date";
import { useLocale, useTranslations } from "next-intl";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Pagination from "@/components/common/Pagination";
import Tab from "@/components/common/Tab";
import TabList from "@/components/common/TabList";
import Toast from "@/components/common/Toast";
import { SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";
import CardMyReview from "@/components/review/CardMyReview";
import CardWritableReview from "@/components/review/CardWritableReview";
import ReviewWriteModal from "@/components/review/ReviewWriteModal";
import CardMyReviewSkeleton from "@/components/skeleton/CardMyReviewSkeleton";
import CardWritableReviewSkeleton from "@/components/skeleton/CardWritableReviewSkeleton";
import SkeletonStatus from "@/components/skeleton/SkeletonStatus";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  reviewQueryKeys,
  reviewService,
  type WritableReviewItem,
} from "@/lib/services/review-service";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { cn } from "@/lib/utils/cn";
import ReviewsEmptyFallback from "./_components/ReviewsEmptyFallback";

type ReviewTab = "writable" | "written";

const TAKE = 4;
const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

function toServiceCode(category: string): ServiceCode {
  return category in SERVICE_LABELS ? (category as ServiceCode) : "SMALL";
}

export default function CustomerReviewsPage() {
  const t = useTranslations("review");
  const tAuthError = useTranslations("authError");
  const locale = useLocale() as DateLocale;

  const tabs: { id: ReviewTab; labelKey: "tabWritable" | "tabWritten"; panelId: string }[] = [
    { id: "writable", labelKey: "tabWritable", panelId: "panel-writable" },
    { id: "written", labelKey: "tabWritten", panelId: "panel-written" },
  ];

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
  const toastTimeoutRef = useRef<number | null>(null);

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
    if (toastTimeoutRef.current != null) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => {
      toastTimeoutRef.current = null;
      setToastMessage(null);
    }, 3000);
  };

  // abort 시점엔 토스트를 안 띄우되, 서버에 PATCH가 이미 들어갔을 수 있어 지금 보고 있는 목록만 다시 받는다.
  const refreshActiveReviewQueries = () =>
    queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all });

  // 성공 후 작성 가능 목록은 1페이지로 돌아간다. 지금 페이지를 그대로 invalidate하면
  // 곧 버려질 페이지 refetch가 한 번 더 나간다. 전부 stale만 찍고 1페이지만 다시 받는다.
  const refreshAfterWriteSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: reviewQueryKeys.all,
      refetchType: "none",
    });
    await queryClient.refetchQueries({
      queryKey: reviewQueryKeys.writable(1, undefined),
      type: "all",
    });
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
      if (controller.signal.aborted) {
        await refreshActiveReviewQueries();
        return;
      }
      closeWriteModal();
      setPageByTab((current) => ({ ...current, writable: 1 }));
      setCursorByTab((current) => ({ ...current, writable: { 1: undefined } }));
      await refreshAfterWriteSuccess();
      showToast(t("submitted"));
    } catch (error) {
      if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
        await refreshActiveReviewQueries();
        return;
      }
      showToast(toAuthErrorMessage(error, tAuthError, t("submitFailed")));
    } finally {
      if (submitAbortRef.current === controller) {
        submitAbortRef.current = null;
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-background-background-100 pc:min-h-[calc(100dvh-88px)] flex min-h-[calc(100dvh-54px)] flex-1 flex-col">
      <TabList aria-label={t("tabsLabel")}>
        {tabs.map((item) => (
          <Tab
            key={item.id}
            id={`tab-${item.id}`}
            controls={item.panelId}
            active={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {t(item.labelKey)}
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
          <p className="text-16 text-gray-gray-400 py-20 text-center">{t("loadFailed")}</p>
        ) : isPending && !data ? (
          <SkeletonStatus
            label={t("loading")}
            className={cn(
              "flex w-full flex-col",
              tab === "writable"
                ? "tablet:max-w-[600px] pc:max-w-[1120px] pc:w-[1120px]"
                : "tablet:max-w-[588px] pc:max-w-[1120px] pc:w-[1120px]"
            )}
          >
            <ul className="flex w-full flex-col gap-5">
              {Array.from({ length: 3 }, (_, index) => (
                <li key={index}>
                  {tab === "writable" ? (
                    <>
                      <div className="tablet:hidden">
                        <CardWritableReviewSkeleton size="sm" />
                      </div>
                      <div className="tablet:block pc:hidden hidden">
                        <CardWritableReviewSkeleton size="md" />
                      </div>
                      <div className="pc:block hidden">
                        <CardWritableReviewSkeleton size="lg" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="tablet:hidden">
                        <CardMyReviewSkeleton size="sm" />
                      </div>
                      <div className="tablet:block hidden">
                        <CardMyReviewSkeleton size="lg" />
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </SkeletonStatus>
        ) : isEmpty ? (
          <ReviewsEmptyFallback
            message={tab === "writable" ? t("emptyWritable") : t("empty")}
            actionLabel={tab === "written" ? t("goWrite") : undefined}
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
                        movingDate={formatMovingDate(item.moving.movingDate, locale)}
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
                        movingDate={formatMovingDate(
                          item.moving.movingDate,
                          locale,
                          writtenSize === "lg"
                        )}
                        rating={item.rating}
                        content={item.comment}
                        createdAt={formatWrittenDate(item.createdAt)}
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
          movingDate={formatMovingDate(selected.moving.movingDate, locale)}
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
