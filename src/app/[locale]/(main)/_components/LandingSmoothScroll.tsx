"use client";

import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";

/**
 * 랜딩 페이지에서만 마우스 휠 스크롤을 관성 있게 부드럽게 만듭니다 (Lenis).
 * 이 페이지를 벗어나면 컴포넌트가 사라지면서 원래 스크롤로 돌아갑니다.
 *
 * - 터치(모바일)는 기기 기본 스크롤을 그대로 씁니다 (Lenis 기본값)
 * - 모션 줄이기 설정이면 아무것도 하지 않습니다
 * - 모달이 열려 body가 잠겨 있으면(useDialog의 overflow:hidden) 건드리지 않습니다.
 *   안 막으면 모달 뒤 페이지가 같이 스크롤됩니다.
 */
export default function LandingSmoothScroll() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <ReactLenis
      root
      options={{ lerp: 0.1, prevent: () => document.body.style.overflow === "hidden" }}
    />
  );
}
