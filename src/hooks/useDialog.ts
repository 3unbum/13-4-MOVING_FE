"use client";

import { useEffect, useRef } from "react";

interface UseDialogOptions {
  open: boolean;
  onClose: () => void;
}

// 모바일/데스크톱 버전이 항상 같이 마운트돼있어서(CSS로만 화면 전환) 같은 모달이 동시에 두 인스턴스 열릴 수 있음 —
// 각자 body.overflow를 저장/복원하면 먼저 닫힌 쪽이 남은 쪽의 "hidden"을 원래값으로 착각해서 스크롤이 안 풀림.
// 그래서 인스턴스별로 저장/복원하지 않고, 열린 모달 개수를 세서 0→1일 때만 잠그고 1→0일 때만 푼다.
let lockCount = 0;
let previousBodyOverflow = "";

function lockScroll() {
  if (lockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount++;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
}

/**
 * Escape 닫기, 배경 스크롤 락, 포커스 트랩. 바깥 클릭 닫기는 Modal에서 처리.
 *
 * 제네릭 T는 panelRef를 붙일 태그 — Modal은 <div>, GnbMenu는 <nav>.
 * 기본값이 HTMLDivElement라 기존 호출부는 그대로 쓸 수 있다.
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>({
  open,
  onClose,
}: UseDialogOptions) {
  const panelRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    // 닫힌 뒤 원래 포커스로 되돌리기 위해 열어 두기 전 엘리먼트를 기억
    const previouslyFocused = document.activeElement as HTMLElement | null;
    lockScroll();
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      // Tab이 모달 밖으로 나가지 않게 처음/끝에서 순환
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === panelRef.current || document.activeElement === first)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
      previouslyFocused?.focus();
    };
  }, [open]);

  return { panelRef };
}
