"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { favoriteQueryKeys } from "@/constants/query-keys/favorites";
import {
  moverAiService,
  type MoverAiChip,
  type MoverAiClientAction,
  type MoverAiMessageView,
} from "@/lib/services/mover-ai-service";
import { ApiError } from "@/lib/utils/api-error";

const SESSION_STORAGE_KEY = "mover-ai-session-id";

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
 * 기사님 AI 채팅 세션·메시지 상태.
 * 모달이 열릴 때 저장된 sessionId로 복원하거나 새 세션을 만듭니다.
 */
export function useMoverAiChat({ open, onRequireLogin }: UseMoverAiChatOptions) {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MoverAiMessageView[]>([]);
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

  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        writeStoredSessionId(null);
        setSessionId(null);
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
          writeStoredSessionId(restored.sessionId);
          return;
        }

        const created = await moverAiService.createSession();
        if (cancelled) return;
        setSessionId(created.sessionId);
        setMessages(created.messages);
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
            writeStoredSessionId(null);
            const created = await moverAiService.createSession();
            if (cancelled) return;
            setSessionId(created.sessionId);
            setMessages(created.messages);
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
  }, [open, handleAuthError]);

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
      } catch (error) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        if (handleAuthError(error)) return;
        setErrorMessage(error instanceof Error ? error.message : "메시지를 보내지 못했어요.");
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending, handleAuthError]
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
    [sessionId, isSending, handleAuthError, queryClient]
  );

  const startNewSession = useCallback(async () => {
    setIsBooting(true);
    setErrorMessage(null);
    writeStoredSessionId(null);
    try {
      const created = await moverAiService.createSession();
      setSessionId(created.sessionId);
      setMessages(created.messages);
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
  }, [handleAuthError]);

  return {
    messages,
    isBooting,
    isSending,
    errorMessage,
    sendText,
    sendChip,
    startNewSession,
  };
}
