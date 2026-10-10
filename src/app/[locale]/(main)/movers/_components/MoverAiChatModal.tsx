"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import chevronLeft from "@/assets/icons/chevron-left-md.svg";
import chevronRight from "@/assets/icons/chevron-right-md.svg";
import likeIcon from "@/assets/icons/like-md-red-active.svg";
import sendIcon from "@/assets/icons/send-md.svg";
import beaverAvatar from "@/assets/images/common/프로필_50.png";
import Modal, { ModalHeader } from "@/components/common/Modal";
import CardMover from "@/components/mover/CardMover";
import { useMoverAiChat } from "@/hooks/useMoverAiChat";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToggleMoverFavorite } from "@/hooks/useToggleMoverFavorite";
import { useRouter } from "@/i18n/navigation";
import type { MoverAiChip, MoverAiMessageView } from "@/lib/services/mover-ai-service";
import type { MoverListItem } from "@/lib/services/mover-service";
import { mapMoverListItemToCard } from "@/lib/utils/mover-list-mapper";
import { cn } from "@/lib/utils/cn";

/** 마우스 포인터 드래그 스크롤 시작 Threshold */
const CAROUSEL_DRAG_THRESHOLD_PX = 10;
/** 캐러셀이 이만큼 스크롤되면 이어지는 click은 상세 이동이 아니다 */
const CAROUSEL_SCROLL_CLICK_THRESHOLD_PX = 5;

function nearestCardIndex(scroller: HTMLElement) {
  const cards = Array.from(scroller.children) as HTMLElement[];
  const left = scroller.scrollLeft;
  let nearest = 0;
  let nearestDist = Infinity;
  cards.forEach((card, index) => {
    const dist = Math.abs(card.offsetLeft - left);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = index;
    }
  });
  return nearest;
}

interface MoverAiChatModalProps {
  open: boolean;
  onClose: () => void;
  onRequireLogin?: () => void;
}

/** 추천 기사 가로 캐러셀 — 스와이프 + 화살표, 탭만 상세 이동 */
function MoverAiCarousel({
  movers,
  onMoverClick,
  favoritedIds,
  isFavoritesLoading,
  getFavoriteCount,
  onFavoriteClick,
}: {
  movers: MoverListItem[];
  onMoverClick: (moverId: number) => void;
  favoritedIds: Set<number>;
  isFavoritesLoading: boolean;
  getFavoriteCount: (moverId: number, baseCount: number) => number;
  onFavoriteClick: (moverId: number, currentCount: number) => void;
}) {
  const t = useTranslations("moverAi");
  const scrollerRef = useRef<HTMLDivElement>(null);
  // 스와이프 직후 딸려 오는 click만 막음 (scroll 이벤트로는 건드리지 않음)
  const suppressClickRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    isMouse: boolean;
  } | null>(null);
  const clearMouseDragRef = useRef<(() => void) | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < movers.length - 1;

  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.children[index] as HTMLElement | undefined;
    if (!card) return;
    // scrollIntoView는 채팅 목록까지 세로로 움직인다
    scroller.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  // 마우스·터치 모두 실제 스크롤량으로만 클릭을 막는다
  const finishDrag = useCallback(
    (pointerId: number) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== pointerId) return;
      const scroller = scrollerRef.current;
      const scrolled =
        scroller != null &&
        Math.abs(scroller.scrollLeft - drag.scrollLeft) > CAROUSEL_SCROLL_CLICK_THRESHOLD_PX;
      suppressClickRef.current = scrolled;
      dragRef.current = null;
      if (!scroller || !drag.isMouse) return;
      scroller.style.scrollBehavior = "";
      if (scrolled) scrollToIndex(nearestCardIndex(scroller));
    },
    [scrollToIndex]
  );

  // 스와이프·화살표로 위치가 바뀌면 활성 인덱스를 맞춤
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const syncIndex = () => {
      if (scroller.children.length === 0) return;
      setActiveIndex(nearestCardIndex(scroller));
    };

    scroller.addEventListener("scroll", syncIndex, { passive: true });
    return () => scroller.removeEventListener("scroll", syncIndex);
  }, [movers.length]);

  useEffect(() => {
    return () => clearMouseDragRef.current?.();
  }, []);

  // setPointerCapture를 쓰면 click이 스크롤러로 가서 카드 상세 이동이 사라진다.
  // 마우스만 window에서 드래그를 따라가고, 터치는 네이티브 가로 스크롤을 쓴다.
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    suppressClickRef.current = false;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const isMouse = event.pointerType === "mouse";
    if (isMouse && event.button !== 0) return;
    clearMouseDragRef.current?.();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
      isMouse,
    };
    if (!isMouse) return;

    const onMove = (ev: PointerEvent) => {
      const drag = dragRef.current;
      const el = scrollerRef.current;
      if (!drag || drag.pointerId !== ev.pointerId || !el) return;
      const dx = ev.clientX - drag.startX;
      if (Math.abs(dx) < CAROUSEL_DRAG_THRESHOLD_PX) return;
      el.style.scrollBehavior = "auto";
      el.scrollLeft = drag.scrollLeft - dx;
    };

    const onUp = (ev: PointerEvent) => {
      clearMouseDragRef.current?.();
      finishDrag(ev.pointerId);
    };

    clearMouseDragRef.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      clearMouseDragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.isMouse || drag.pointerId !== event.pointerId) return;
    finishDrag(event.pointerId);
  };

  const handleCardClick = (moverId: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onMoverClick(moverId);
  };

  return (
    <div className="relative w-full">
      <div
        ref={scrollerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "relative flex w-full cursor-grab gap-3 overflow-x-auto scroll-smooth pb-1 active:cursor-grabbing",
          "touch-pan-x snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]",
          "[&::-webkit-scrollbar]:hidden"
        )}
      >
        {movers.map((mover) => {
          const card = mapMoverListItemToCard(mover);
          const favoriteCount = getFavoriteCount(mover.id, card.favoriteCount);
          const isFavorited = favoritedIds.has(mover.id);
          return (
            <div
              key={mover.id}
              // 한 장이 크게 보이도록 — 옆 카드는 살짝 peek
              className="w-[min(100%,368px)] shrink-0 snap-start select-none"
              role="link"
              tabIndex={0}
              onClick={() => handleCardClick(mover.id)}
              onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onMoverClick(mover.id);
                }
              }}
            >
              <CardMover
                size="sm"
                className="cursor-pointer"
                categories={card.categories}
                title={card.title}
                nickName={card.nickName}
                profileImage={card.profileImage}
                rating={card.rating}
                reviewCount={card.reviewCount}
                career={card.career}
                confirmedCount={card.confirmedCount}
                favoriteCount={favoriteCount}
                isFavorited={isFavorited}
                onFavoriteClick={
                  isFavoritesLoading ? undefined : () => onFavoriteClick(mover.id, favoriteCount)
                }
              />
            </div>
          );
        })}
      </div>

      {movers.length > 1 && (
        <>
          <button
            type="button"
            aria-label={t("carouselPrev")}
            disabled={!canPrev}
            onClick={(event) => {
              event.stopPropagation();
              if (canPrev) scrollToIndex(activeIndex - 1);
            }}
            className={cn(
              "shadow-modal absolute top-1/2 left-1 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50/95 transition-opacity",
              "not-disabled:hover:bg-orange-100",
              "disabled:cursor-not-allowed disabled:opacity-30"
            )}
          >
            <Image src={chevronLeft} alt="" className="size-6" />
          </button>
          <button
            type="button"
            aria-label={t("carouselNext")}
            disabled={!canNext}
            onClick={(event) => {
              event.stopPropagation();
              if (canNext) scrollToIndex(activeIndex + 1);
            }}
            className={cn(
              "shadow-modal absolute top-1/2 right-1 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50/95 transition-opacity",
              "not-disabled:hover:bg-orange-100",
              "disabled:cursor-not-allowed disabled:opacity-30"
            )}
          >
            <Image src={chevronRight} alt="" className="size-6" />
          </button>
        </>
      )}
    </div>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M11.9992 22.4999C10.0492 22.4999 8.27966 22.0172 6.69055 21.0518C5.10145 20.0864 3.85498 18.7928 2.95115 17.171V20.1537H1.45117V14.6538H6.95115V16.1537H4.11072C4.83381 17.6102 5.9024 18.782 7.3165 19.6692C8.73061 20.5564 10.2915 21 11.9992 21C13.2236 21 14.372 20.7737 15.4444 20.3211C16.5168 19.8685 17.4556 19.2509 18.2607 18.4682C19.0659 17.6855 19.7124 16.7612 20.2002 15.6952C20.688 14.6291 20.9511 13.4807 20.9896 12.25H22.4896C22.4575 13.6705 22.1604 15.0025 21.5982 16.2461C21.036 17.4897 20.2822 18.5762 19.3367 19.5057C18.3912 20.4352 17.2886 21.1666 16.029 21.6999C14.7694 22.2333 13.4261 22.4999 11.9992 22.4999ZM1.50887 11.7499C1.55376 10.2974 1.86049 8.94772 2.42907 7.70092C2.99766 6.45414 3.75791 5.36922 4.70982 4.44615C5.66176 3.52308 6.76271 2.80129 8.0127 2.28077C9.2627 1.76026 10.5915 1.5 11.9992 1.5C13.93 1.5 15.6995 1.9843 17.3079 2.9529C18.9162 3.9215 20.1627 5.22633 21.0473 6.86738V3.8462H22.5473V9.34615H17.0473V7.8462H19.8877C19.1839 6.4154 18.1233 5.25 16.706 4.35C15.2887 3.44997 13.7197 2.99995 11.9992 2.99995C10.8005 2.99995 9.66653 3.22302 8.5973 3.66917C7.52808 4.11532 6.5877 4.72654 5.77615 5.50282C4.96461 6.27911 4.31013 7.20026 3.8127 8.26627C3.31526 9.33231 3.04731 10.4935 3.00885 11.7499L1.50887 11.7499Z"
        fill="currentColor"
      />
    </svg>
  );
}

function renderContentWithBold(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    const matched = /^\*\*([^*]+)\*\*$/.exec(part);
    if (matched) {
      return (
        <strong key={index} className="font-bold">
          {matched[1]}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function BeaverSpeakBubble({ content }: { content: string }) {
  const t = useTranslations("moverAi");

  return (
    <div className="flex w-full max-w-[92%] items-end gap-2">
      <div
        className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-orange-400"
        aria-hidden
      >
        <Image
          src={beaverAvatar}
          alt=""
          width={40}
          height={40}
          className="size-full scale-110 object-cover object-center"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-12 mb-1 font-semibold text-orange-500">{t("beaverName")}</p>
        <p
          className={cn(
            "rounded-2xl rounded-bl-md bg-orange-100 px-3.5 py-2.5",
            "text-14 text-black-400 leading-relaxed whitespace-pre-wrap"
          )}
        >
          {renderContentWithBold(content)}
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onChipClick,
  onMoverClick,
  chipsDisabled,
  favoritedIds,
  isFavoritesLoading,
  getFavoriteCount,
  onFavoriteClick,
}: {
  message: MoverAiMessageView;
  onChipClick: (chip: MoverAiChip) => void;
  onMoverClick: (moverId: number) => void;
  chipsDisabled: boolean;
  favoritedIds: Set<number>;
  isFavoritesLoading: boolean;
  getFavoriteCount: (moverId: number, baseCount: number) => number;
  onFavoriteClick: (moverId: number, currentCount: number) => void;
}) {
  const isUser = message.role === "USER";
  const chips = message.ui?.chips ?? null;
  const movers = message.ui?.movers ?? null;

  return (
    <div className={cn("flex w-full flex-col gap-2", isUser ? "items-end" : "items-start")}>
      {isUser ? (
        <p
          className={cn(
            "max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5",
            "text-14 bg-orange-400 leading-relaxed whitespace-pre-wrap text-gray-50"
          )}
        >
          {message.content}
        </p>
      ) : (
        <BeaverSpeakBubble content={message.content} />
      )}

      {movers && movers.length > 0 && (
        <div className="w-full pl-12">
          <MoverAiCarousel
            movers={movers}
            onMoverClick={onMoverClick}
            favoritedIds={favoritedIds}
            isFavoritesLoading={isFavoritesLoading}
            getFavoriteCount={getFavoriteCount}
            onFavoriteClick={onFavoriteClick}
          />
        </div>
      )}

      {chips && chips.length > 0 && (
        <div className="flex max-w-full flex-wrap gap-2 pl-12">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={chipsDisabled}
              onClick={() => onChipClick(chip)}
              className={cn(
                "text-13 inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-3 py-1.5 font-medium text-orange-500 transition-colors",
                "not-disabled:hover:border-orange-300 not-disabled:hover:bg-orange-200",
                "disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              {chip.action === "CHANGE_FILTERS" && (
                <RefreshIcon className="size-3.5 shrink-0 text-orange-500" />
              )}
              {chip.action === "FAVORITE_ALL" && (
                <Image src={likeIcon} alt="" className="size-4.5 shrink-0" />
              )}
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 기사님 AI 찾기 채팅 모달 — BE `/mover-ai` 연동.
 */
export default function MoverAiChatModal({ open, onClose, onRequireLogin }: MoverAiChatModalProps) {
  const t = useTranslations("moverAi");
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasBusyRef = useRef(false);
  const router = useRouter();
  const isTabletUp = useMediaQuery("(min-width: 744px)");
  const [input, setInput] = useState("");

  const { messages, isBooting, isSending, errorMessage, sendText, sendChip, startNewSession } =
    useMoverAiChat({ open, onRequireLogin });

  const { favoritedIds, isFavoritesLoading, toggleFavorite, getFavoriteCount } =
    useToggleMoverFavorite({ onRequireLogin });

  const busy = isBooting || isSending;

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, isBooting, isSending]);

  // disabled 되면 브라우저가 포커스를 빼므로, 다시 입력 가능해질 때 복구
  useEffect(() => {
    if (!open) {
      wasBusyRef.current = false;
      return;
    }
    const wasBusy = wasBusyRef.current;
    wasBusyRef.current = busy;
    if (wasBusy && !busy && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [open, busy, messages.length]);

  // effect에서 setState 하면 cascading render 경고 — 닫는 시점에 입력 초기화
  const handleClose = () => {
    setInput("");
    onClose();
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendText(text);
  };

  const handleMoverClick = (moverId: number) => {
    handleClose();
    router.push(`/movers/${moverId}`);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy={titleId}
      position={isTabletUp ? "center" : "bottom"}
      className={cn(
        "h-dvh max-h-dvh w-full rounded-none",
        "tablet:h-[min(720px,85dvh)] tablet:max-h-[calc(100dvh-2rem)] tablet:w-120 tablet:rounded-3xl",
        "pc:w-[560px]"
      )}
    >
      <div className="flex h-full min-h-0 flex-col pb-4">
        <div className="tablet:px-6 tablet:pt-6 tablet:pb-5 shrink-0 border-b border-gray-100 px-5 pt-5 pb-4">
          <ModalHeader id={titleId} title={t("modalTitle")} size="sm" onClose={handleClose} />
        </div>

        <div
          ref={listRef}
          className="tablet:px-6 mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-2"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {isBooting && messages.length === 0 && (
            <p className="text-14 text-gray-500">{t("booting")}</p>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onChipClick={(chip) => void sendChip(chip)}
              onMoverClick={handleMoverClick}
              chipsDisabled={busy}
              favoritedIds={favoritedIds}
              isFavoritesLoading={isFavoritesLoading}
              getFavoriteCount={getFavoriteCount}
              onFavoriteClick={toggleFavorite}
            />
          ))}

          {isSending && <p className="text-14 text-gray-500">{t("thinking")}</p>}

          {errorMessage && (
            <div className="text-14 flex flex-col gap-2 rounded-2xl bg-red-100 px-3.5 py-2.5 text-red-200">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => void startNewSession()}
                className="self-start font-semibold underline"
              >
                {t("retrySession")}
              </button>
            </div>
          )}
        </div>

        <form
          className="tablet:px-6 mt-3 flex shrink-0 items-center gap-2 px-5"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <label htmlFor="mover-ai-chat-input" className="sr-only">
            {t("inputLabel")}
          </label>
          <input
            ref={inputRef}
            id="mover-ai-chat-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("inputPlaceholder")}
            disabled={busy || !messages.length}
            className={cn(
              "bg-background-100 text-black-400 placeholder:text-gray-400",
              "text-14 h-12 min-w-0 flex-1 rounded-2xl px-4 focus:outline-none",
              "focus-visible:ring-2 focus-visible:ring-orange-300",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label={t("send")}
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-400 transition-colors",
              "not-disabled:hover:bg-orange-500",
              "disabled:cursor-not-allowed disabled:bg-gray-300"
            )}
          >
            <Image src={sendIcon} alt="" className="size-6" />
          </button>
        </form>
      </div>
    </Modal>
  );
}
