"use client";

import { useEffect, useState } from "react";

/**
 * 스크롤이 뷰포트 높이(1배) 이상이면 true.
 * scroll 이벤트는 rAF로 한 프레임에 한 번만 반영합니다.
 */
export function useScrollToTopVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frameId = 0;

    const update = () => {
      frameId = 0;
      setVisible(window.scrollY >= window.innerHeight);
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return visible;
}
