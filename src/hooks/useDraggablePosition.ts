"use client";

import { useRef, useState, type PointerEvent } from "react";
import { useViewportSize } from "@/hooks/useViewportSize";

export type DraggablePosition = { right: number; bottom: number };

interface UseDraggablePositionOptions {
  /** 위치를 저장할 localStorage 키 */
  storageKey: string;
  /** 끌 대상(버튼)의 한 변 길이(px) — 화면 밖으로 못 나가게 가두는 기준 */
  size: number;
  /** 저장된 위치가 없을 때의 우측·하단 여백(px) */
  defaultPosition: DraggablePosition;
  /** 이만큼(px) 움직여야 클릭이 아니라 드래그로 본다 */
  threshold?: number;
}

type DragState = {
  startX: number;
  startY: number;
  startRight: number;
  startBottom: number;
  active: boolean;
  moved: boolean;
  last: DraggablePosition;
};

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

function readPosition(key: string, fallback: DraggablePosition): DraggablePosition {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) ?? "null");
    if (typeof saved?.right === "number" && typeof saved?.bottom === "number") return saved;
  } catch {
    // 저장소를 못 읽어도(차단·SSR) 기본 위치로 동작한다
  }
  return fallback;
}

function writePosition(key: string, position: DraggablePosition) {
  try {
    window.localStorage.setItem(key, JSON.stringify(position));
  } catch {
    // 저장 실패는 무시 — 다음 방문에 기본 위치로 시작할 뿐이다
  }
}

/**
 * 우측·하단 기준으로 fixed 배치된 요소를 끌어 옮기게 한다. 놓을 때 위치를 저장해 다음 방문에 복원한다.
 *
 * 반환한 `dragHandlers`를 버튼에 펼쳐 달고, 버튼의 onClick에서는 `consumeDrag()`가 true면 무시한다.
 * (끌고 난 뒤에도 click이 따라오기 때문에, 안 거르면 옮길 때마다 창이 열리고 닫힌다)
 */
export function useDraggablePosition({
  storageKey,
  size,
  defaultPosition,
  threshold = 5,
}: UseDraggablePositionOptions) {
  const viewport = useViewportSize();
  const [position, setPosition] = useState<DraggablePosition>(() =>
    readPosition(storageKey, defaultPosition)
  );
  const drag = useRef<DragState | null>(null);

  // 창 크기가 줄어도 요소가 화면 밖으로 나가지 않게 렌더 때마다 가둔다
  const right = viewport.width ? clamp(position.right, viewport.width - size) : position.right;
  const bottom = viewport.height ? clamp(position.bottom, viewport.height - size) : position.bottom;

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      startRight: right,
      startBottom: bottom,
      active: true,
      moved: false,
      last: { right, bottom },
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    if (!state?.active) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) < threshold) return;
    state.moved = true;
    state.last = {
      right: clamp(state.startRight - dx, window.innerWidth - size),
      bottom: clamp(state.startBottom - dy, window.innerHeight - size),
    };
    setPosition(state.last);
  };

  const onPointerUp = () => {
    const state = drag.current;
    if (!state?.active) return;
    state.active = false;
    if (state.moved) writePosition(storageKey, state.last);
  };

  /** 방금 끌었으면 true를 주고 상태를 비운다 — onClick 맨 앞에서 호출 */
  const consumeDrag = () => {
    if (!drag.current?.moved) return false;
    drag.current = null;
    return true;
  };

  return {
    right,
    bottom,
    viewport,
    consumeDrag,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
