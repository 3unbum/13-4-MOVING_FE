"use client";

import { useEffect } from "react";

/** 운영 빌드에서만 등록합니다 — dev에서는 HMR과 캐시가 꼬입니다 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
