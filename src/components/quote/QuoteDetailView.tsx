"use client";

import Image from "next/image";
import Button from "@/components/common/Button";
import EtcButton from "@/components/common/EtcButton";
import { ConfirmedBadge, PendingBadge } from "@/components/common/CardParts";
import Header from "@/components/common/Header";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import MoverMeta from "@/components/mover/MoverMeta";
import MoverName from "@/components/mover/MoverName";
import MoveTypeChip from "@/components/filter/ChipMoveType";
import { SERVICE_LABELS } from "@/components/filter/ChipRegion";
import QuoteShare from "@/components/quote/QuoteShare";
import { cn } from "@/lib/utils/cn";
import type { Estimate } from "@/lib/services/estimate-service";
import type { QuotationRequest } from "@/lib/services/quotation-request-service";
// 카드용 빨간 하트가 아니라 검은 하트입니다 (피그마 견적 상세 기준)
import likeBlack from "@/assets/icons/like-md-active.svg";
import logoMark from "@/assets/icons/logo-mark-sm.svg";

interface QuoteDetailViewProps {
  estimate: Estimate;
  request: QuotationRequest;
  onConfirm: () => void;
  isConfirming: boolean;
  /** 찜 여부 — 모바일·태블릿 하단 CTA 왼쪽 하트 */
  isFavorited: boolean;
  onToggleFavorite: () => void;
  isTogglingFavorite: boolean;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKst(iso: string) {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS);
}

/** "24.08.26" — 견적 요청일 */
function formatShortDate(iso: string) {
  const k = toKst(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${String(k.getUTCFullYear()).slice(2)}.${p(k.getUTCMonth() + 1)}.${p(k.getUTCDate())}`;
}

/** "2026. 09. 28(월)" — 이용일 */
function formatMovingDate(iso: string) {
  const k = toKst(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${k.getUTCFullYear()}. ${p(k.getUTCMonth() + 1)}. ${p(k.getUTCDate())}(${WEEKDAYS[k.getUTCDay()]})`;
}

/**
 * 견적가 표기.
 *
 * 반려(REJECTED) 견적은 `price`가 null입니다. `?? 0`으로 두면 화면에 "0원"이
 * 찍혀 실제로 0원에 해주겠다는 제안처럼 읽힙니다 — 받았던 견적 탭에서 반려
 * 견적 상세로 들어올 수 있으므로(시드 기준 15건) 값 없음을 그대로 밝힙니다.
 */
function formatPrice(price: number | null) {
  if (price === null) return "견적가 없음";
  return `${price.toLocaleString("ko-KR")}원`;
}

/**
 * 견적 정보 블록의 한 줄.
 *
 * 피그마는 라벨·값 모두 왼쪽 정렬이고 값이 고정 위치에서 시작합니다
 * (태블릿 기준 라벨 90 + 간격 23). 라벨 폭을 고정해 값 시작점을 맞춥니다.
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-6">
      <span className="text-14 text-gray-gray-400 pc:text-18 pc:w-24 w-20 shrink-0 font-normal">
        {label}
      </span>
      <span className="text-14 text-black-300 pc:text-18 min-w-0 font-medium">{value}</span>
    </div>
  );
}

/**
 * 견적 상세 (페이지 8-1).
 *
 * 상태별로 세 가지 화면이 있습니다 — 피그마 `1:9115`(대기) / `1:11818`(확정) / `1:11870`(미확정).
 * 차이는 배지·확정 버튼·하단 안내 세 군데뿐이라 한 컴포넌트에서 분기합니다.
 */
export default function QuoteDetailView({
  estimate,
  request,
  onConfirm,
  isConfirming,
  isFavorited,
  onToggleFavorite,
  isTogglingFavorite,
}: QuoteDetailViewProps) {
  const { mover, estimateStatus, isTargeted } = estimate;

  const isPending = estimateStatus === "PENDING";
  const isConfirmed = estimateStatus === "CONFIRMED";
  // 지난 요청에서 확정되지 않은 채 끝난 견적 — 하단에 안내가 붙습니다
  const isUnconfirmed = !isPending && !isConfirmed;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header size="sm" className="tablet:hidden">
        견적 상세
      </Header>
      <Header size="md" className="tablet:flex pc:hidden hidden">
        견적 상세
      </Header>
      <Header size="lg" className="pc:flex hidden">
        견적 상세
      </Header>

      {/* 히어로 — 주황 배경에 무빙 로고 마크가 흐리게 흩어집니다 (피그마 모바일 122 / PC 180).
          프로필이 아래로 겹쳐 나오므로 overflow-hidden은 여기서만 겁니다. */}
      <div
        className="tablet:h-39.25 pc:h-45 relative h-30.5 w-full overflow-hidden bg-orange-400"
        aria-hidden
      >
        <Image
          src={logoMark}
          alt=""
          className="pc:w-40 pointer-events-none absolute -top-4 left-[8%] w-24 opacity-15"
        />
        <Image
          src={logoMark}
          alt=""
          className="pc:w-56 pointer-events-none absolute top-6 left-[58%] w-32 opacity-15"
        />
      </div>

      <div className="bg-background-background-100 tablet:px-18 pc:px-10 flex flex-1 justify-center px-6">
        <div className="pc:max-w-285 pc:flex-row pc:gap-35 tablet:max-w-150 flex w-full max-w-81.75 flex-col">
          {/* 좌: 본문 */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* 히어로에 겹치는 프로필 */}
            {/* 피그마: 모바일 64(`1:9246`) / 태블릿 100(`1:9222`) / PC 134(`1:9148`).
                ProfileAvatar가 size를 한 값만 받아 세 벌을 CSS로 전환합니다. */}
            <div className="tablet:-mt-19.25 pc:-mt-20.75 -mt-10.5">
              <div className="tablet:hidden">
                <ProfileAvatar src={mover.image} alt={mover.nickName} size="64" />
              </div>
              <div className="tablet:block pc:hidden hidden">
                <ProfileAvatar src={mover.image} alt={mover.nickName} size="100" />
              </div>
              <div className="pc:block hidden">
                <ProfileAvatar src={mover.image} alt={mover.nickName} size="134" />
              </div>
            </div>

            <div className="pc:gap-6 pc:pt-6 flex flex-col gap-5 pt-5">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <MoveTypeChip variant={request.category} size="sm" />
                  {isTargeted && <MoveTypeChip variant="TARGETED" size="sm" />}
                </div>
                {isPending && <PendingBadge />}
                {isConfirmed && <ConfirmedBadge />}
              </div>

              <p className="text-18 text-black-300 pc:text-24 font-semibold">{mover.bio}</p>

              <div className="border-line-100 flex flex-col gap-2 border-b pb-5">
                <div className="flex w-full items-center justify-between">
                  {/* 이름 텍스트 높이가 세 사이즈 모두 26px(text-18)입니다 —
                      모바일 `I1:9248;1:4297` / PC `I1:9147;1:4211`. 반응형 분기가 아닙니다. */}
                  <MoverName nickName={mover.nickName} size="xl" />
                  {/* 피그마는 숫자가 먼저, 하트가 뒤 + 검은 하트라 CardParts의
                      FavoriteCount(하트→숫자, 빨간 하트)를 그대로 쓸 수 없습니다 */}
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-14 text-black-300 font-medium">
                      {mover.favoriteCount}
                    </span>
                    <Image src={likeBlack} alt="" className="size-6" />
                  </div>
                </div>
                <MoverMeta
                  rating={mover.avgRating}
                  reviewCount={mover.reviewCount}
                  career={mover.career}
                  confirmedCount={mover.confirmedCount}
                />
              </div>

              {/* 견적가 — PC는 우측 사이드에도 있지만 본문에도 그대로 있습니다.
                  정렬이 사이즈마다 다릅니다: 모바일(`1:9249`)은 라벨·값이 양 끝,
                  태블릿(`1:9178`)·PC(`1:9149`)는 값이 113px에서 시작합니다. */}
              <div className="border-line-100 tablet:justify-start flex items-center justify-between border-b pb-5">
                <span className="text-16 text-black-300 pc:text-20 tablet:w-28.25 font-semibold">
                  견적가
                </span>
                <span className="text-18 text-black-400 pc:text-24 font-bold">
                  {formatPrice(estimate.price)}
                </span>
              </div>

              <div className="pc:gap-6 flex flex-col gap-4">
                <h2 className="text-16 text-black-300 pc:text-20 font-semibold">견적 정보</h2>
                <div className="pc:gap-4 flex flex-col gap-3">
                  <InfoRow label="견적 요청일" value={formatShortDate(request.createdAt)} />
                  <InfoRow label="서비스" value={SERVICE_LABELS[request.category]} />
                  <InfoRow label="이용일" value={formatMovingDate(request.movingDate)} />
                  <InfoRow label="출발지" value={request.fromAddress} />
                  <InfoRow label="도착지" value={request.toAddress} />
                </div>
              </div>

              {isUnconfirmed && (
                <div className="bg-background-200 text-14 text-gray-gray-500 flex items-center gap-2 rounded-lg px-4 py-4 font-medium">
                  <span aria-hidden>ⓘ</span>
                  확정하지 않은 견적이에요!
                </div>
              )}

              {/* 모바일·태블릿은 본문 안에 공유가 들어갑니다 (PC는 우측 사이드).
                  하단 고정 CTA(110px)가 덮지 않도록 확정 대기일 때 여백을 더 둡니다. */}
              <QuoteShare
                title="나만 알긴 아쉬운 기사님인가요?"
                moverId={mover.id}
                className={cn(
                  "pc:hidden border-line-100 border-t pt-6",
                  isPending ? "pb-32" : "pb-8"
                )}
              />
            </div>
          </div>

          {/* 우: PC 전용 사이드 — 견적가 + 확정 버튼 + 공유 */}
          {/* 우: PC 전용 사이드 — 견적가 + 확정 버튼 + 공유.
              피그마 여백: 히어로 끝 364 → 첫 요소 547 = pt-45.75,
              견적가 블록 끝 605 → 버튼 634 = mt-7.25, 버튼~구분선~공유 각 40 = my-10.

              ⚠️ QuoteShare는 isPending 밖에 둬야 합니다. 확정(`1:11818` → `1:11821`)과
              미확정(`1:11870`) 화면에도 공유 영역이 있습니다. */}
          <aside className="pc:flex hidden w-80 shrink-0 flex-col pt-45.75">
            {isPending && (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-16 text-black-300 font-semibold">견적가</span>
                  <span className="text-24 text-black-400 font-bold">
                    {formatPrice(estimate.price)}
                  </span>
                </div>
                <Button
                  variant="solid"
                  size="lg"
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className="mt-7.25 h-16"
                >
                  견적 확정하기
                </Button>
                <hr className="border-line-100 my-10" />
              </>
            )}
            <QuoteShare title="견적서 공유하기" moverId={mover.id} />
          </aside>
        </div>
      </div>

      {/* 모바일·태블릿 하단 고정 CTA (피그마 `1:9227` 375 / `1:9172` 744 — 높이 110).
          피그마에는 위쪽 구분선이 없습니다. */}
      {isPending && (
        <div className="pc:hidden tablet:px-18 fixed inset-x-0 bottom-0 z-10 flex w-full justify-center bg-gray-50 px-6 py-7">
          {/* 하트 54 + 간격 8 + CTA (피그마 하트 x=0 w=54 / CTA x=62) */}
          <div className="tablet:max-w-150 flex w-full max-w-81.75 items-center gap-2">
            <EtcButton
              kind="like"
              size="sm"
              active={isFavorited}
              onClick={onToggleFavorite}
              disabled={isTogglingFavorite}
            />
            <div className="min-w-0 flex-1">
              <Button variant="solid" size="sm" onClick={onConfirm} disabled={isConfirming}>
                견적 확정하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
