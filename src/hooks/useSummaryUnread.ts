"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { NotificationSummaryLine } from "@/components/layout/DropdownNotification";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const MEMORY_SCOPE = "__memory__";

const listeners = new Set<() => void>();
const memorySeen = new Map<string, string>();

function kstDateKey(now = new Date()) {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 오늘 요약 스냅샷. 건수가 바뀌거나 날짜가 바뀌면 다른 값이 된다. */
export function summarySignature(lines: NotificationSummaryLine[] | undefined) {
  if (!lines || lines.length === 0) return "";

  const body = lines
    .flatMap((line) => line.parts.map((part) => `${line.region}:${part.category}:${part.count}`))
    .sort()
    .join("|");

  if (!body) return "";
  return `${kstDateKey()}|${body}`;
}

function storageKey(scope: string) {
  return `moving:notification-summary-seen:${scope}`;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readSeen(scope: string | null) {
  if (!scope) return memorySeen.get(MEMORY_SCOPE) ?? null;
  return window.localStorage.getItem(storageKey(scope));
}

function writeSeen(scope: string | null, signature: string) {
  if (!scope) {
    memorySeen.set(MEMORY_SCOPE, signature);
    emit();
    return;
  }
  window.localStorage.setItem(storageKey(scope), signature);
  emit();
}

/**
 * 오늘 새 요청을 종으로 열기 전에는 읽지 않은 것으로 본다.
 * 같은 스냅샷을 다시 열면 점은 켜지지 않고, 건수가 늘면 다시 켜진다.
 */
export function useSummaryUnread(
  scope: string | null,
  lines: NotificationSummaryLine[] | undefined
) {
  const signature = summarySignature(lines);
  const seen = useSyncExternalStore(
    subscribe,
    () => readSeen(scope),
    () => null
  );

  const markSummarySeen = useCallback(() => {
    if (!signature || signature === readSeen(scope)) return;
    writeSeen(scope, signature);
  }, [scope, signature]);

  return {
    summaryUnread: signature !== "" && signature !== seen,
    markSummarySeen,
  };
}
