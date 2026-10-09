"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { favoriteQueryKeys } from "@/constants/query-keys/favorites";
import {
  moverAiService,
  type MoverAiChip,
  type MoverAiClientAction,
  type MoverAiFilters,
  type MoverAiMessageView,
} from "@/lib/services/mover-ai-service";
import { ApiError } from "@/lib/utils/api-error";

const SESSION_STORAGE_KEY = "mover-ai-session-id";
const FILTERS_STORAGE_KEY = "mover-ai-filters";

const EMPTY_FILTERS: MoverAiFilters = {
  region: null,
  service: null,
  sort: null,
};

function readStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredSessionId(sessionId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (sessionId) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // sessionStorage 차단 환경 — 메모리 세션만 사용
  }
}

function readStoredFilters(): MoverAiFilters | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    return {
      region: typeof record.region === "string" ? record.region : null,
      service: typeof record.service === "string" ? record.service : null,
      sort:
        record.sort === "rating" ||
        record.sort === "review" ||
        record.sort === "career" ||
        record.sort === "confirmed"
          ? record.sort
          : null,
    };
  } catch {
    return null;
  }
}

function writeStoredFilters(filters: MoverAiFilters | null) {
  if (typeof window === "undefined") return;
  try {
    if (filters) {
      sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } else {
      sessionStorage.removeItem(FILTERS_STORAGE_KEY);
    }
  } catch {
    // sessionStorage 차단 환경 — 메모리만 사용
  }
}

function clearStoredSession() {
  writeStoredSessionId(null);
  writeStoredFilters(null);
}

function toClientAction(chip: MoverAiChip): MoverAiClientAction {
  // 서비스·정렬·중의적 지역 해소는 chip.value(enum)를 그대로 전달합니다
  if (
    chip.action === "SELECT_SERVICE" ||
    chip.action === "SELECT_SORT" ||
    chip.action === "SELECT_REGION"
  ) {
    return { type: chip.action, value: chip.value };
  }
  return { type: chip.action, value: null };
}

interface UseMoverAiChatOptions {
  open: boolean;
  /** 401 등 로그인 필요 시 */
  onRequireLogin?: () => void;
}

/**
 * 기사님 AI 채팅 세션·메시지·필터 상태.
 * 모달이 열릴 때 저장된 sessionId로 복원하거나 새 세션을 만듭니다.
 */
export function useMoverAiChat({ open, onRequireLogin }: UseMoverAiChatOptions) {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MoverAiMessageView[]>([]);
  const [filters, setFilters] = useState<MoverAiFilters>(
    () => readStoredFilters() ?? EMPTY_FILTERS
  );
  const [isBooting, setIsBooting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 모달 닫았다 열 때 메모리 대화를 유지하기 위한 스냅샷
  const sessionIdRef = useRef<string | null>(null);
  const messagesRef = useRef<MoverAiMessageView[]>([]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
    messagesRef.current = messages;
  }, [sessionId, messages]);

  const applyFilters = useCallback((next: MoverAiFilters) => {
    setFilters(next);
    writeStoredFilters(next);
  }, []);

  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearStoredSession();
        setSessionId(null);
        setFilters(EMPTY_FILTERS);
        onRequireLogin?.();
        return true;
      }
      return false;
    },
    [onRequireLogin]
  );

  useEffect(() => {
    if (!open) return;

    // 이미 대화·카드가 메모리에 있으면 재조회로 덮어쓰지 않음
    if (sessionIdRef.current && messagesRef.current.length > 0) {
      return;
    }

    let cancelled = false;

    async function boot() {
      setIsBooting(true);
      setErrorMessage(null);

      const storedId = readStoredSessionId();
      try {
        if (storedId) {
          const restored = await moverAiService.getSession(storedId);
          if (cancelled) return;
          setSessionId(restored.sessionId);
          setMessages(restored.messages);
          applyFilters(restored.filters);
          writeStoredSessionId(restored.sessionId);
          return;
        }

        const created = await moverAiService.createSession();
        if (cancelled) return;
        setSessionId(created.sessionId);
        setMessages(created.messages);
        applyFilters(EMPTY_FILTERS);
        writeStoredSessionId(created.sessionId);
      } catch (error) {
        if (cancelled) return;
        if (handleAuthError(error)) {
          setMessages([]);
          return;
        }
        // 저장된 세션이 없거나 만료된 경우 새 세션 시도
        if (storedId && error instanceof ApiError && error.status === 404) {
          try {
            clearStoredSession();
            const created = await moverAiService.createSession();
            if (cancelled) return;
            setSessionId(created.sessionId);
            setMessages(created.messages);
            applyFilters(EMPTY_FILTERS);
            writeStoredSessionId(created.sessionId);
            return;
          } catch (retryError) {
            if (cancelled) return;
            if (handleAuthError(retryError)) {
              setMessages([]);
              return;
            }
            setErrorMessage(
              retryError instanceof Error ? retryError.message : "세션을 시작하지 못했어요."
            );
            return;
          }
        }
        setErrorMessage(error instanceof Error ? error.message : "세션을 시작하지 못했어요.");
      } finally {
        if (!cancelled) setIsBooting(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [open, handleAuthError, applyFilters]);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !sessionId || isSending) return;

      const optimisticId = `local-user-${Date.now()}`;
      setMessages((prev) => [...prev, { id: optimisticId, role: "USER", content: trimmed }]);
      setIsSending(true);
      setErrorMessage(null);

      try {
        const result = await moverAiService.postMessage(sessionId, { message: trimmed });
        setMessages((prev) => [...prev, result.assistantMessage]);
        applyFilters(result.filters);
      } catch (error) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        if (handleAuthError(error)) return;
        setErrorMessage(error instanceof Error ? error.message : "메시지를 보내지 못했어요.");
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending, handleAuthError, applyFilters]
  );

  const sendChip = useCallback(
    async (chip: MoverAiChip) => {
      if (!sessionId || isSending) return;

      const optimisticId = `local-user-${Date.now()}`;
      setMessages((prev) => [...prev, { id: optimisticId, role: "USER", content: chip.label }]);
      setIsSending(true);
      setErrorMessage(null);

      try {
        const result = await moverAiService.postMessage(sessionId, {
          message: chip.label,
          clientAction: toClientAction(chip),
        });
        setMessages((prev) => [...prev, result.assistantMessage]);
        applyFilters(result.filters);
        if (chip.action === "FAVORITE_ALL") {
          void queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.all });
        }
      } catch (error) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        if (handleAuthError(error)) return;
        setErrorMessage(error instanceof Error ? error.message : "요청을 처리하지 못했어요.");
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending, handleAuthError, queryClient, applyFilters]
  );

  const startNewSession = useCallback(async () => {
    setIsBooting(true);
    setErrorMessage(null);
    clearStoredSession();
    try {
      const created = await moverAiService.createSession();
      setSessionId(created.sessionId);
      setMessages(created.messages);
      applyFilters(EMPTY_FILTERS);
      writeStoredSessionId(created.sessionId);
    } catch (error) {
      if (handleAuthError(error)) {
        setMessages([]);
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : "세션을 시작하지 못했어요.");
    } finally {
      setIsBooting(false);
    }
  }, [handleAuthError, applyFilters]);

  return {
    messages,
    filters,
    isBooting,
    isSending,
    errorMessage,
    sendText,
    sendChip,
    startNewSession,
  };
}
