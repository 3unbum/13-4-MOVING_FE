"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import chatLg from "@/assets/icons/chat-lg.svg";
import chevronLeft from "@/assets/icons/chevron-left-md.svg";
import ChatRoomList from "@/components/chat/ChatRoomList";
import ChatRoomView from "@/components/chat/ChatRoomView";
import { useChatRooms } from "@/hooks/useChat";
import { useDraggablePosition } from "@/hooks/useDraggablePosition";
import { useOutsideClose } from "@/hooks/useOutsideClose";
import { CHAT_OPEN_EVENT, type ChatOpenDetail } from "@/lib/utils/chat-open";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";

const PANEL_ID = "chat-panel";
const BUTTON_SIZE = 75; // size-18.75
const PANEL_WIDTH = 360; // pc:w-90
const PANEL_HEIGHT = 520; // pc:h-130
const PANEL_GAP = 8;

// 우측 하단 플로팅 채팅 버튼 + 열리는 창. 버튼은 끌어서 옮길 수 있고, 창은 버튼을 따라간다.
// 창 안은 방 목록 → 대화 두 단계다.
export default function ChatWidget() {
  const t = useTranslations("chat");
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  // 대화 중인 방. null이면 방 목록을 보여준다
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; name: string } | null>(null);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  // 버튼 배지용 — 창이 닫혀 있어도 새 메시지를 알려야 해서 로그인하면 바로 받아 둔다
  const { unreadTotal } = useChatRooms(isAuthenticated);

  const { right, bottom, viewport, dragHandlers, consumeDrag } = useDraggablePosition({
    storageKey: "chat-widget-position",
    size: BUTTON_SIZE,
    defaultPosition: { right: 16, bottom: 16 },
  });

  // 채팅은 페이지를 보면서 쓰는 창이라 바깥 클릭으로는 닫지 않고 Escape만 받는다
  useOutsideClose({
    isOpen,
    onClose: () => setIsOpen(false),
    ref: panelRef,
    closeOnOutsideClick: false,
  });

  // 키보드·스크린 리더 사용자를 위한 포커스 이동 — 열리면(또는 방을 고르면) 창으로 옮기고,
  // 닫히면 열었던 버튼으로 되돌린다. 안 그러면 방 목록 버튼이 사라지는 순간 포커스가 문서 맨 앞으로 튄다.
  const selectedRoomId = selectedRoom?.id;
  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
    else if (wasOpenRef.current) buttonRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen, selectedRoomId]);

  // 알림에서 "이 방 열어줘"가 오면 창을 열고 그 방으로 들어간다
  useEffect(() => {
    const onOpen = (event: Event) => {
      const { roomId, name } = (event as CustomEvent<ChatOpenDetail>).detail;
      setSelectedRoom({ id: roomId, name });
      setPanelOffset({ x: 0, y: 0 });
      setIsOpen(true);
    };
    window.addEventListener(CHAT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CHAT_OPEN_EVENT, onOpen);
  }, []);

  if (!isAuthenticated) return null;

  // 버튼 위치에 따라 창이 열리는 방향을 바꿔 화면 밖으로 잘리지 않게 한다.
  // 어느 쪽에도 다 안 들어가면 더 넓은 쪽으로 열고 높이를 그 공간에 맞춰 줄인다.
  const spaceAbove = viewport.height - bottom - BUTTON_SIZE - PANEL_GAP;
  const spaceBelow = bottom - PANEL_GAP;
  const opensUp = !viewport.height || spaceAbove >= PANEL_HEIGHT || spaceAbove >= spaceBelow;
  const maxHeight = viewport.height ? Math.max(0, opensUp ? spaceAbove : spaceBelow) : undefined;
  const alignsRight = !viewport.width || viewport.width - right >= PANEL_WIDTH;

  // 헤더를 끌면 창만 따로 옮긴다. 화면 밖으로는 못 나가게 가두고, 닫으면 버튼 옆으로 되돌린다.
  const onHeaderPointerDown = (event: PointerEvent<HTMLElement>) => {
    const panel = panelRef.current;
    if (event.button !== 0 || !panel || (event.target as HTMLElement).closest("button")) return;
    const rect = panel.getBoundingClientRect();
    const { x: startDx, y: startDy } = panelOffset;
    const startX = event.clientX;
    const startY = event.clientY;
    const clampTo = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(value, max));
    const onMove = (move: globalThis.PointerEvent) => {
      setPanelOffset({
        x: clampTo(
          startDx + move.clientX - startX,
          startDx - rect.left,
          startDx + window.innerWidth - rect.right
        ),
        y: clampTo(
          startDy + move.clientY - startY,
          startDy - rect.top,
          startDy + window.innerHeight - rect.bottom
        ),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const onClick = () => {
    // 끌고 난 뒤에 따라오는 click은 창을 열고 닫지 않는다
    if (consumeDrag()) return;
    setPanelOffset({ x: 0, y: 0 });
    setIsOpen((prev) => !prev);
  };

  // 모바일 전체화면 패널이 fixed GNB(1000) 아래에 깔리지 않게 sticky 이상
  return (
    <div className="fixed z-[var(--z-sticky)]" style={{ right, bottom }}>
      <button
        ref={buttonRef}
        type="button"
        // 배지는 시각용(aria-hidden)이라 읽지 않은 수는 버튼 이름에 넣어 스크린 리더에도 알린다
        aria-label={
          isOpen
            ? t("close")
            : unreadTotal > 0
              ? t("openWithUnread", { count: unreadTotal })
              : t("open")
        }
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        {...dragHandlers}
        onClick={onClick}
        className="relative flex size-18.75 cursor-grab touch-none items-center justify-center rounded-full border border-gray-200 bg-white shadow-md select-none active:cursor-grabbing"
      >
        <Image src={chatLg} alt="" width={50} height={50} draggable={false} />
        {unreadTotal > 0 && (
          <span
            aria-hidden
            className="text-13 absolute -top-1 -right-1 min-w-6 rounded-full bg-orange-400 px-1.5 text-center font-semibold text-white"
          >
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          ref={panelRef}
          id={PANEL_ID}
          role="dialog"
          aria-label={t("title")}
          tabIndex={-1}
          style={
            {
              "--chat-max-h": maxHeight === undefined ? "none" : `${maxHeight}px`,
              "--chat-dx": `${panelOffset.x}px`,
              "--chat-dy": `${panelOffset.y}px`,
            } as CSSProperties
          }
          className={cn(
            // 모바일 전체 화면은 dvh로 — inset-0(레이아웃 뷰포트)이면 iOS에서 키보드가 올라올 때 하단 입력창이 가려진다
            "fixed inset-x-0 top-0 flex h-dvh flex-col bg-white shadow-md outline-none",
            "pc:absolute pc:inset-auto pc:h-130 pc:max-h-(--chat-max-h) pc:w-90 pc:translate-x-(--chat-dx) pc:translate-y-(--chat-dy) pc:rounded-2xl",
            opensUp ? "pc:bottom-full pc:mb-2" : "pc:top-full pc:mt-2",
            alignsRight ? "pc:right-0" : "pc:left-0"
          )}
        >
          <header
            onPointerDown={onHeaderPointerDown}
            className="pc:cursor-move pc:touch-none flex items-center justify-between border-b border-gray-200 px-4 py-3 select-none"
          >
            <div className="flex items-center gap-2">
              {/* 대화 중이면 목록으로, 목록이면(모바일만) 창 닫기. 모바일은 전체 화면이라 바깥으로 빠져나갈 곳이 없다 */}
              <button
                type="button"
                aria-label={t("back")}
                onClick={() => (selectedRoom ? setSelectedRoom(null) : setIsOpen(false))}
                className={cn(
                  "-ml-1 flex size-8 items-center justify-center",
                  !selectedRoom && "pc:hidden"
                )}
              >
                <Image src={chevronLeft} alt="" width={24} height={24} />
              </button>
              <h2 className="text-16 font-semibold">{selectedRoom?.name ?? t("title")}</h2>
            </div>
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setIsOpen(false)}
              className="text-18 pc:block hidden text-gray-500"
            >
              <span aria-hidden>✕</span>
            </button>
          </header>

          {selectedRoom ? (
            <ChatRoomView
              key={selectedRoom.id}
              roomId={selectedRoom.id}
              onUnavailable={() => setSelectedRoom(null)}
            />
          ) : (
            <ChatRoomList
              onSelect={(room) => setSelectedRoom({ id: room.id, name: room.counterpart.name })}
            />
          )}
        </section>
      )}
    </div>
  );
}
