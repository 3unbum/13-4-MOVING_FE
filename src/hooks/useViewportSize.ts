"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

// 서버 스냅샷은 0 — 클라이언트 첫 렌더와 일치시켜 하이드레이션 불일치를 막는다.
// 0이면 "화면 크기를 아직 모른다"는 뜻이니 호출부에서 크기 계산을 건너뛴다.
export function useViewportSize() {
  const width = useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 0
  );
  const height = useSyncExternalStore(
    subscribe,
    () => window.innerHeight,
    () => 0
  );
  return { width, height };
}
