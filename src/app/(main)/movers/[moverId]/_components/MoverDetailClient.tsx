"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import moverDetailBannerLg from "@/assets/images/common/mover-detail-banner-lg.svg";
import moverDetailBannerMd from "@/assets/images/common/mover-detail-banner-md.svg";
import moverDetailBannerSm from "@/assets/images/common/mover-detail-banner-sm.svg";
import Toast from "@/components/common/Toast";
import InfoRequiredModal from "@/components/quote/InfoRequiredModal";
import { moverQueryKeys } from "@/constants/query-keys/movers";
import { useMoverDetail } from "@/hooks/useMoverDetail";
import { myQuotesKeys } from "@/hooks/useMyQuotes";
import { useShare } from "@/hooks/useShare";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToggleMoverFavorite } from "@/hooks/useToggleMoverFavorite";
import { quotationRequestService } from "@/lib/services/quotation-request-service";
import { ApiError } from "@/lib/utils/api-error";
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
    text: mover
      ? `이사를 준비하시나요? ${mover.nickName} 기사님을 추천합니다. 무빙에서 확인해 보세요!`
      : "이사를 준비하시나요? 무빙에서 확인해 보세요!",
    buttonTitle: "기사님 정보 보러가기",
  });

  const { favoritedIds, isFavoritesLoading, toggleFavorite, getFavoriteCount } =
    useToggleMoverFavorite({
      onRequireLogin: () => setModalKind("login"),
    });

  // 활성 일반 견적 — 지정 요청 가드용 (CUSTOMER만)
  const activeRequestQuery = useQuery({
    queryKey: myQuotesKeys.activeRequest,
    queryFn: () => quotationRequestService.getActive(),
    enabled: isCustomer,
  });

  const targetMutation = useMutation({
    mutationFn: async () => {
      const active = activeRequestQuery.data;
      if (!active) {
        throw new ApiError(400, {
          code: "NO_ACTIVE_REQUEST",
          message: "일반 견적 요청을 먼저 진행해 주세요.",
        });
      }
      return quotationRequestService.createTargeted(active.id, moverId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: moverQueryKeys.detail(moverId) });
      setToastMessage("지정 견적 요청이 완료되었어요");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "ALREADY_TARGETED") {
        void queryClient.invalidateQueries({ queryKey: moverQueryKeys.detail(moverId) });
        setToastMessage("이미 지정 견적을 요청한 기사님이에요");
        return;
      }
      setToastMessage(error instanceof Error ? error.message : "요청에 실패했습니다");
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
        잘못된 기사님 주소입니다.
      </p>
    );
  }

  if (detailQuery.isPending) {
    return <p className="text-14 text-gray-gray-500 p-10 text-center">불러오는 중…</p>;
  }

  if (detailQuery.isError || !mover) {
    return (
      <p className="text-14 p-10 text-center text-red-200" role="alert">
        기사님 정보를 불러오지 못했습니다.
        {detailQuery.error instanceof Error ? ` (${detailQuery.error.message})` : null}
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
      setToastMessage("일반 유저만 지정 견적을 요청할 수 있어요");
      return;
    }
    if (isTargeted || targetMutation.isPending) {
      return;
    }
    // 활성 요청 조회 중이면 잠깐 대기
    if (activeRequestQuery.isPending) {
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

      <div className="relative mx-auto w-full max-w-[1920px]">
        <MoverDetailAvatar image={mover.image} nickName={mover.nickName} />

        <div
          className={cn(
            "px-5 pt-4",
            "tablet:px-18 tablet:pt-6",
            "pc:flex pc:items-start pc:gap-29 pc:px-[359px] pc:pt-8"
          )}
        >
          <div className="pc:w-191.5 flex min-w-0 flex-1 flex-col gap-10">
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

            <div className="border-line-100 border-t pt-10">
              {/* TODO(리뷰 담당): 여기에 리뷰 영역(요약·목록·페이지네이션)을 삽입하세요 */}
            </div>
          </div>

          <aside className="pc:flex hidden w-80 shrink-0 flex-col gap-17.5">
            <MoverDetailDesktopCta
              nickName={mover.nickName}
              isFavorited={isFavorited}
              isTargeted={isTargeted}
              isRequestPending={targetMutation.isPending}
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

      <MoverDetailMobileStickyCta
        isFavorited={isFavorited}
        isTargeted={isTargeted}
        isRequestPending={targetMutation.isPending}
        onRequestQuote={handleRequestQuote}
        onToggleFavorite={handleToggleFavorite}
      />

      <InfoRequiredModal
        open={modalKind === "login"}
        onClose={closeModal}
        size={infoModalSize}
        title="로그인이 필요합니다"
        message="로그인 후 이용할 수 있어요."
        actionLabel="로그인하기"
        onAction={() => {
          closeModal();
          router.push("/customer/login");
        }}
      />

      <InfoRequiredModal
        open={modalKind === "needQuote"}
        onClose={closeModal}
        size={infoModalSize}
        title="지정 견적 요청하기"
        message="일반 견적 요청을 먼저 진행해 주세요."
        actionLabel="일반 견적 요청 하기"
        onAction={() => {
          closeModal();
          router.push("/customer/quotation-requests");
        }}
      />

      {displayToast && <Toast message={displayToast} />}
    </div>
  );
}
