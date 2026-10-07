"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
// useParams는 locale과 무관한 동적 세그먼트(moverId)를 읽으므로 next/navigation 그대로 씁니다
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import moverDetailBannerLg from "@/assets/images/common/mover-detail-banner-lg.svg";
import moverDetailBannerMd from "@/assets/images/common/mover-detail-banner-md.svg";
import moverDetailBannerSm from "@/assets/images/common/mover-detail-banner-sm.svg";
import Pagination from "@/components/common/Pagination";
import ProgressBar from "@/components/common/ProgressBar";
import SkeletonBone from "@/components/common/SkeletonBone";
import Sort from "@/components/common/Sort";
import Toast from "@/components/common/Toast";
import InfoRequiredModal from "@/components/quote/InfoRequiredModal";
import CardReview from "@/components/review/CardReview";
import {
  ReviewPhotoListModal,
  ReviewPhotoModal,
  ReviewPhotoStrip,
} from "@/components/review/ReviewPhotoGallery";
import CardReviewSkeleton, {
  ReviewDistributionSkeleton,
} from "@/components/skeleton/CardReviewSkeleton";
import SkeletonStatus from "@/components/skeleton/SkeletonStatus";
import { moverQueryKeys } from "@/constants/query-keys/movers";
import { useMoverDetail } from "@/hooks/useMoverDetail";
import { myQuotesKeys } from "@/hooks/useMyQuotes";
import { useShare } from "@/hooks/useShare";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToggleMoverFavorite } from "@/hooks/useToggleMoverFavorite";
import {
  DEFAULT_MOVER_REVIEW_SORT,
  MOVER_REVIEW_SORTS,
  getReviewImageGallery,
  moverService,
  type MoverRatingDistribution,
  type MoverReviewImageItem,
  type MoverReviewItem,
  type MoverReviewSort,
} from "@/lib/services/mover-service";
import { quotationRequestService } from "@/lib/services/quotation-request-service";
import { ApiError } from "@/lib/utils/api-error";
import { toAuthErrorDetail, toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";
import { MoverDetailDesktopCta, MoverDetailMobileStickyCta } from "./MoverDetailCta";
import MoverDetailProfile, { MoverDetailAvatar } from "./MoverDetailProfile";
import MoverDetailShare from "./MoverDetailShare";

type ModalKind = "login" | "needQuote" | null;

const TABLET_QUERY = "(min-width: 744px)";

/**
 * 기사님 상세 클라이언트 페이지.
 * - 비회원: 찜·지정견적 → 로그인 모달
 * - CUSTOMER + 활성 견적 없음 → InfoRequiredModal
 * - CUSTOMER + 가능 → 지정 견적 API
 * - 이미 지정(isTargeted) → CTA 비활성
 */
export default function MoverDetailClient() {
  const t = useTranslations("mover");
  const tAuthError = useTranslations("authError");
  const tQuote = useTranslations("quote");
  const tCommon = useTranslations("common");
  const params = useParams<{ moverId: string }>();
  const moverId = Number(params.moverId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { account, isAuthenticated } = useAuth();
  const isCustomer = isAuthenticated && account?.role === "CUSTOMER";

  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // InfoRequiredModal 공통 기본은 md — 상세만 뷰포트에 맞춰 size 전달
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const infoModalSize = isTabletUp ? "md" : "sm";

  const detailQuery = useMoverDetail(moverId);
  const mover = detailQuery.data;

  // 공유 문구·URL은 기사님마다 달라 상세 로드 후 훅에 넘김 (비로그인·로그인 UI 동일)
  const {
    copyLink,
    shareToKakao,
    shareToFacebook,
    toast: shareToast,
  } = useShare({
    url: Number.isFinite(moverId) && moverId > 0 ? `/movers/${moverId}` : "/",
    text: mover ? tQuote("shareText", { moverName: mover.nickName }) : t("shareTextFallback"),
    buttonTitle: tQuote("shareButtonTitle"),
  });

  const { favoritedIds, isFavoritesLoading, toggleFavorite, getFavoriteCount } =
    useToggleMoverFavorite({
      onRequireLogin: () => setModalKind("login"),
    });

  // 활성 일반 견적 — 지정 요청 가드용 (CUSTOMER만)
  const activeRequestQuery = useQuery({
    queryKey: myQuotesKeys.activeRequestByAuth(account?.userId ?? null),
    queryFn: () => quotationRequestService.getActive(),
    enabled: isCustomer,
  });

  const targetMutation = useMutation({
    mutationFn: async () => {
      const active = activeRequestQuery.data;
      if (!active) {
        throw new ApiError(400, {
          code: "NO_ACTIVE_REQUEST",
          message: tQuote("targetedMessage"),
        });
      }
      return quotationRequestService.createTargeted(active.id, moverId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: moverQueryKeys.detail(moverId) });
      setToastMessage(t("targetedDone"));
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "ALREADY_TARGETED") {
        void queryClient.invalidateQueries({ queryKey: moverQueryKeys.detail(moverId) });
        setToastMessage(t("alreadyTargeted"));
        return;
      }
      setToastMessage(toAuthErrorMessage(error, tAuthError, tCommon("requestFailed")));
    },
  });

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timer = window.setTimeout(() => setToastMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  if (!Number.isFinite(moverId) || moverId <= 0) {
    return (
      <p className="text-14 p-10 text-center text-red-200" role="alert">
        {t("invalidMoverPath")}
      </p>
    );
  }

  if (detailQuery.isPending) {
    return <MoverDetailSkeleton label={t("loading")} />;
  }

  if (detailQuery.isError || !mover) {
    const errorDetail = toAuthErrorDetail(detailQuery.error, tAuthError);
    return (
      <p className="text-14 p-10 text-center text-red-200" role="alert">
        {t("moverLoadFailed")}
        {errorDetail ? ` (${errorDetail})` : null}
      </p>
    );
  }

  // 찜 목록 로드 전에는 상세 API의 isFavorited를 쓰고, 로드 후엔 Set 기준
  const isFavorited = isCustomer
    ? isFavoritesLoading
      ? Boolean(mover.isFavorited)
      : favoritedIds.has(mover.id)
    : false;
  const favoriteCount = getFavoriteCount(mover.id, mover.favoriteCount);
  const isTargeted = Boolean(mover.isTargeted);
  // disabled 쿼리의 isPending은 손님이 true라 CUSTOMER일 때만 묶음
  const isRequestPending = (isCustomer && activeRequestQuery.isPending) || targetMutation.isPending;

  const handleToggleFavorite = () => {
    if (isFavoritesLoading) {
      return;
    }
    toggleFavorite(mover.id, favoriteCount);
  };

  const handleRequestQuote = () => {
    if (!isAuthenticated) {
      setModalKind("login");
      return;
    }
    if (!isCustomer) {
      setToastMessage(t("customerOnly"));
      return;
    }
    if (isTargeted || isRequestPending) {
      return;
    }
    if (activeRequestQuery.isError) {
      setToastMessage(t("activeRequestCheckFailed"));
      return;
    }
    if (!activeRequestQuery.data) {
      setModalKind("needQuote");
      return;
    }
    targetMutation.mutate();
  };

  const closeModal = () => setModalKind(null);
  const displayToast = shareToast ?? toastMessage;

  return (
    <div className="pc:pb-20 flex min-h-screen flex-col bg-white pb-27.5">
      <div
        className={cn(
          "relative w-full overflow-hidden bg-orange-400",
          "tablet:h-[157px] pc:h-[225px] h-30.5"
        )}
      >
        <Image
          src={moverDetailBannerSm}
          alt=""
          width={375}
          height={122}
          unoptimized
          priority
          className="tablet:hidden pointer-events-none absolute inset-0 size-full object-cover object-center"
        />
        <Image
          src={moverDetailBannerMd}
          alt=""
          width={744}
          height={157}
          unoptimized
          className="tablet:block pc:hidden pointer-events-none absolute inset-0 hidden size-full object-cover object-center"
        />
        <Image
          src={moverDetailBannerLg}
          alt=""
          width={1920}
          height={225}
          unoptimized
          className="pc:block pointer-events-none absolute inset-0 hidden size-full object-cover object-center"
        />
      </div>

      <div className="tablet:px-18 pc:px-0 flex w-full flex-col items-center px-5">
        {/* 내부는 피그마 고정폭. 창 크기 변화는 좌우 여백만. 리뷰 페이지와 동일 패턴 */}
        <div className="tablet:max-w-[600px] pc:max-w-[1202px] pc:w-[1202px] w-full">
          <MoverDetailAvatar image={mover.image} nickName={mover.nickName} />

          <div
            className={cn("pt-4", "tablet:pt-6", "pc:flex pc:items-start pc:gap-[116px] pc:pt-8")}
          >
            <div className="pc:w-[766px] pc:shrink-0 flex w-full min-w-0 flex-col gap-8">
              <MoverDetailProfile
                mover={mover}
                favoriteCount={favoriteCount}
                isFavorited={isFavorited}
              />

              <div className="pc:hidden border-line-100 border-t pt-8">
                <MoverDetailShare
                  size="xs"
                  onCopyLink={copyLink}
                  onShareKakao={shareToKakao}
                  onShareFacebook={shareToFacebook}
                />
              </div>

              {/* 피그마: 공유 아래 디바이더 → 리뷰 제목·분포·목록·페이지네이션 */}
              <div className="border-line-100 pc:pt-10 border-t pt-8">
                <MoverDetailReviews moverId={mover.id} />
              </div>
            </div>

            <aside className="pc:flex hidden w-80 shrink-0 flex-col gap-17.5">
              <MoverDetailDesktopCta
                nickName={mover.nickName}
                isFavorited={isFavorited}
                isTargeted={isTargeted}
                isRequestPending={isRequestPending}
                onRequestQuote={handleRequestQuote}
                onToggleFavorite={handleToggleFavorite}
              />
              <MoverDetailShare
                size="md"
                onCopyLink={copyLink}
                onShareKakao={shareToKakao}
                onShareFacebook={shareToFacebook}
              />
            </aside>
          </div>
        </div>
      </div>

      <MoverDetailMobileStickyCta
        isFavorited={isFavorited}
        isTargeted={isTargeted}
        isRequestPending={isRequestPending}
        onRequestQuote={handleRequestQuote}
        onToggleFavorite={handleToggleFavorite}
      />

      <InfoRequiredModal
        open={modalKind === "login"}
        onClose={closeModal}
        size={infoModalSize}
        title={t("loginRequired")}
        message={t("loginToUse")}
        actionLabel={t("goLogin")}
        onAction={() => {
          closeModal();
          router.push("/customer/login");
        }}
      />

      <InfoRequiredModal
        open={modalKind === "needQuote"}
        onClose={closeModal}
        size={infoModalSize}
        title={tQuote("targetedTitle")}
        message={tQuote("targetedMessage")}
        actionLabel={tQuote("targetedAction")}
        onAction={() => {
          closeModal();
          router.push("/customer/quotation-requests");
        }}
      />

      {displayToast && <Toast message={displayToast} />}
    </div>
  );
}

const REVIEW_TAKE = 5;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * "2024-08-26" — 기사님 상세의 리뷰 작성일.
 *
 * `date.ts`의 `formatWrittenDate`("2024. 08. 26")와 구분자가 다릅니다. 숫자·하이픈뿐이라
 * 로케일과 무관해 그대로 둡니다. 표기를 통일할지는 피그마 대조가 필요합니다.
 */
function formatReviewCreatedAt(iso: string) {
  const kst = new Date(new Date(iso).getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** CardReview는 마스킹된 작성자를 받는다. */
function maskReviewWriter(name: string) {
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

const REVIEW_SORT_LABEL = {
  oldest: "sortOldest",
  latest: "sortLatest",
  ratingDesc: "sortRatingDesc",
  ratingAsc: "sortRatingAsc",
} as const;

function ReviewHeading() {
  const tReview = useTranslations("review");
  return (
    <h2 className="text-16 tablet:text-20 text-black-black-400 font-semibold">
      {tReview("title")}
    </h2>
  );
}

/** 상세 첫 로딩 뼈대 */
function MoverDetailSkeleton({ label }: { label: string }) {
  const chips = (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <SkeletonBone
          key={index}
          className="tablet:h-7 tablet:w-20 tablet:rounded-md h-6 w-18 rounded"
        />
      ))}
    </div>
  );

  return (
    <SkeletonStatus label={label} className="pc:pb-20 flex min-h-screen flex-col bg-white pb-27.5">
      {/* 배너 — 원본과 같은 높이·배경. 이미지는 생략 */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-orange-400",
          "tablet:h-[157px] pc:h-[225px] h-30.5"
        )}
      />

      <div className="tablet:px-18 pc:px-0 flex w-full flex-col items-center px-5">
        <div className="tablet:max-w-[600px] pc:max-w-[1202px] pc:w-[1202px] w-full">
          <div className={cn("relative z-10", "-mt-10.5", "tablet:-mt-[77px]", "pc:-mt-[103px]")}>
            <SkeletonBone className="tablet:hidden size-16 rounded-xl" />
            <SkeletonBone className="tablet:block pc:hidden hidden size-25 rounded-xl" />
            <SkeletonBone className="pc:block hidden size-33.5 rounded-xl" />
          </div>

          <div
            className={cn("pt-4", "tablet:pt-6", "pc:flex pc:items-start pc:gap-[116px] pc:pt-8")}
          >
            <div className="pc:w-[766px] pc:shrink-0 flex w-full min-w-0 flex-col gap-8">
              {/* MoverDetailProfile 골격 */}
              <section className="flex w-full flex-col gap-8">
                <div className="flex w-full flex-col gap-[31px]">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      {chips}
                      <SkeletonBone className="tablet:h-8 pc:h-8 h-6.5 w-3/4" />
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                      <SkeletonBone className="h-6.5 w-32" />
                      <SkeletonBone className="h-6.5 w-16" />
                    </div>
                    <div className="flex w-full flex-col gap-1">
                      <SkeletonBone className="h-6 w-full" />
                      <SkeletonBone className="h-6 w-5/6" />
                    </div>
                  </div>

                  {/* 통계 박스 뼈대 */}
                  <SkeletonBone className="tablet:h-30 h-[95px] w-full rounded-2xl" />
                </div>

                <div className="flex flex-col gap-4">
                  <SkeletonBone className="tablet:h-8 h-6.5 w-28" />
                  {chips}
                </div>
                <div className="flex flex-col gap-4">
                  <SkeletonBone className="tablet:h-8 h-6.5 w-24" />
                  {chips}
                </div>
              </section>

              {/* 모바일·태블릿 공유 자리 */}
              <div className="pc:hidden border-line-100 flex flex-col gap-3 border-t pt-8">
                <SkeletonBone className="h-8 w-40" />
                <div className="flex items-center gap-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <SkeletonBone key={index} className="size-10 rounded-xl" />
                  ))}
                </div>
              </div>

              {/* 리뷰 — 상세 로드 후 MoverDetailReviews 첫 로딩과 같은 구성 */}
              <div className="border-line-100 pc:pt-10 flex flex-col gap-4 border-t pt-8">
                <ReviewHeading />
                <ReviewDistributionSkeleton />
                <ul className="divide-line-100 flex w-full flex-col divide-y">
                  {Array.from({ length: 3 }, (_, index) => (
                    <li key={index}>
                      <div className="tablet:hidden">
                        <CardReviewSkeleton size="sm" />
                      </div>
                      <div className="tablet:block hidden">
                        <CardReviewSkeleton size="lg" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* PC 사이드바 — CTA + 공유 */}
            <aside className="pc:flex hidden w-80 shrink-0 flex-col gap-17.5">
              <div className="flex w-80 flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <SkeletonBone className="h-7 w-full" />
                  <SkeletonBone className="h-7 w-2/3" />
                </div>
                <SkeletonBone className="h-13.5 w-full rounded-2xl" />
                <SkeletonBone className="h-13.5 w-full rounded-2xl" />
              </div>
              <div className="flex flex-col gap-5.5">
                <SkeletonBone className="h-8 w-36" />
                <div className="flex items-center gap-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <SkeletonBone key={index} className="size-16 rounded-2xl" />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* 모바일·태블릿 sticky CTA 자리 */}
      <div
        className={cn(
          "pc:hidden border-line-100 fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t bg-white",
          "h-27.5 px-6 py-7",
          "tablet:px-18"
        )}
      >
        <div className="tablet:mx-auto tablet:max-w-150 flex items-center gap-2">
          <SkeletonBone className="size-13.5 shrink-0 rounded-2xl" />
          <SkeletonBone className="h-13.5 min-w-0 flex-1 rounded-2xl" />
        </div>
      </div>
    </SkeletonStatus>
  );
}

/** 상세 페이지 리뷰 영역. 마이페이지 공용 섹션과 분리해서 여기서만 다룬다. */
function MoverDetailReviews({ moverId }: { moverId: number }) {
  const tReview = useTranslations("review");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<MoverReviewSort>(DEFAULT_MOVER_REVIEW_SORT);
  const [photoListOpen, setPhotoListOpen] = useState(false);
  const [photoViewer, setPhotoViewer] = useState<{
    slides: MoverReviewImageItem[];
    index: number;
    known: MoverReviewItem[];
    fromList?: boolean;
  } | null>(null);
  // 피그마: 모바일 Card-list-review sm, 태블릿·PC lg
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const reviewCardSize = isTabletUp ? "lg" : "sm";
  const sortOptions = MOVER_REVIEW_SORTS.map((value) => ({
    value,
    label: tReview(REVIEW_SORT_LABEL[value]),
  }));

  const handleSortChange = (value: string) => {
    if (!MOVER_REVIEW_SORTS.includes(value as MoverReviewSort)) return;
    setSort(value as MoverReviewSort);
    setPage(1);
  };

  const listQuery = useQuery({
    queryKey: moverQueryKeys.reviewList(moverId, page, sort),
    queryFn: () => moverService.getReviews(moverId, page, REVIEW_TAKE, sort),
    placeholderData: keepPreviousData,
  });

  const distributionQuery = useQuery({
    queryKey: moverQueryKeys.reviewDistribution(moverId),
    queryFn: () => moverService.getReviewDistribution(moverId),
  });

  const imagesQuery = useQuery({
    queryKey: moverQueryKeys.reviewImages(moverId),
    queryFn: () => getReviewImageGallery(moverId),
  });

  if (listQuery.isPending && !listQuery.data) {
    return (
      <SkeletonStatus label={tReview("loading")} className="flex w-full flex-col gap-4">
        <ReviewHeading />
        <ReviewDistributionSkeleton />
        <ul className="divide-line-100 flex w-full flex-col divide-y">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index}>
              <div className="tablet:hidden">
                <CardReviewSkeleton size="sm" />
              </div>
              <div className="tablet:block hidden">
                <CardReviewSkeleton size="lg" />
              </div>
            </li>
          ))}
        </ul>
      </SkeletonStatus>
    );
  }

  // 분포 실패는 목록을 가리지 않는다. 목록 API만 에러일 때 전체 실패.
  if (listQuery.isError) {
    return (
      <div className="flex w-full flex-col gap-4">
        <ReviewHeading />
        <p className="text-16 text-gray-gray-400 py-20 text-center">{tReview("loadFailed")}</p>
      </div>
    );
  }

  const items = listQuery.data?.data ?? [];
  const totalPages = listQuery.data?.totalPages ?? 0;
  const isEmpty = (listQuery.data?.totalCount ?? 0) === 0;
  const distribution = distributionQuery.isError ? undefined : distributionQuery.data;
  const gallery = imagesQuery.data?.items ?? [];

  const openReviewPhotos = (item: MoverReviewItem, imageUrl: string) => {
    const galleryIndex = gallery.findIndex(
      (photo) => photo.reviewId === item.id && photo.imageUrl === imageUrl
    );
    if (galleryIndex >= 0) {
      setPhotoViewer({ slides: gallery, index: galleryIndex, known: items });
      return;
    }

    const urls = item.imageUrls ?? [];
    setPhotoViewer({
      slides: urls.map((url) => ({ reviewId: item.id, imageUrl: url })),
      index: Math.max(0, urls.indexOf(imageUrl)),
      known: [item],
    });
  };

  if (isEmpty) {
    // 피그마 상세 empty는 이미지 없이 제목 + 안내 문구만 (1:8169 / 1:8766)
    return (
      <div className="flex w-full flex-col gap-4">
        <ReviewHeading />
        <div className="flex w-full flex-col py-6 text-center">
          <p className="text-16 text-black-500 leading-7 font-semibold">{tReview("empty")}</p>
          <p className="text-14 text-gray-gray-400 leading-7">{tReview("emptyHint")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <ReviewHeading />
          <Sort
            size={isTabletUp ? "md" : "sm"}
            options={sortOptions}
            value={sort}
            onChange={handleSortChange}
          />
        </div>
        <ReviewPhotoStrip items={gallery} onOpen={() => setPhotoListOpen(true)} />
        {distribution ? <ProgressBar data={toProgressBarData(distribution)} hideTitle /> : null}

        <ul className="divide-line-100 flex w-full flex-col divide-y">
          {items.map((item) => (
            <li key={item.id}>
              <CardReview
                size={reviewCardSize}
                writer={maskReviewWriter(item.customerName)}
                createdAt={formatReviewCreatedAt(item.createdAt)}
                rating={item.rating}
                content={item.comment}
                images={item.imageUrls ?? []}
                onImageClick={(imageUrl) => openReviewPhotos(item, imageUrl)}
              />
            </li>
          ))}
        </ul>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-8 justify-center"
      />
      {photoListOpen ? (
        <ReviewPhotoListModal
          open
          onClose={() => setPhotoListOpen(false)}
          items={gallery}
          onSelect={(index) => {
            setPhotoListOpen(false);
            setPhotoViewer({ slides: gallery, index, known: items, fromList: true });
          }}
        />
      ) : null}
      {photoViewer ? (
        <ReviewPhotoModal
          key={`${photoViewer.index}-${photoViewer.slides[photoViewer.index]?.imageUrl ?? ""}`}
          open
          onClose={() => setPhotoViewer(null)}
          slides={photoViewer.slides}
          initialIndex={photoViewer.index}
          moverId={moverId}
          knownReviews={photoViewer.known}
          onBack={
            photoViewer.fromList
              ? () => {
                  setPhotoViewer(null);
                  setPhotoListOpen(true);
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
