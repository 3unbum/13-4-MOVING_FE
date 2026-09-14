"use client";

import { useEffect, useRef, type RefObject } from "react";

interface UseOutsideCloseOptions {
  /** 열려 있을 때만 리스너를 건다 */
  isOpen: boolean;
  onClose: () => void;
  /** 이 엘리먼트 바깥을 클릭하면 닫는다 */
  ref: RefObject<HTMLElement | null>;
  /** Escape로도 닫을지 (기본 true). DatePicker처럼 바깥 클릭만 쓰는 곳은 false */
  closeOnEscape?: boolean;
  /** 바깥 클릭 닫기를 끌 수 있게 (기본 true). 호출부가 옵션으로 제어하는 경우 사용 */
  closeOnOutsideClick?: boolean;
}

/**
 * 드롭다운·팝오버 공통 "바깥 클릭 + Escape로 닫기".
 *
 * 같은 패턴이 7곳에 복붙돼 있어 한 곳을 고쳐도 나머지가 그대로 남는 문제가 있었다.
 * `mousedown`을 쓰는 이유는 `click`이면 트리거 버튼을 다시 눌렀을 때
 * 닫힘 → 열림이 연달아 일어나 토글이 안 되기 때문이다(기존 구현도 전부 mousedown).
 */
export function useOutsideClose({
  isOpen,
  onClose,
  ref,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: UseOutsideCloseOptions) {
  // onClose가 매 렌더 새 함수여도 리스너를 다시 걸지 않도록 ref로 잡아둔다
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!closeOnOutsideClick) return;
      if (!ref.current?.contains(event.target as Node)) {
        onCloseRef.current();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    if (closeOnEscape) document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      if (closeOnEscape) document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, ref, closeOnEscape, closeOnOutsideClick]);
}
