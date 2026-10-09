import { cookieFetch } from "@/lib/utils/api-client";
import type { MoverListItem } from "@/lib/services/mover-service";

/** BE `MoverAiNextAction` */
export type MoverAiNextAction =
  | "ASK_REGION"
  | "ASK_SERVICE"
  | "ASK_SORT"
  | "SHOW_MOVERS"
  | "CLARIFY_UNSUPPORTED"
  | "CLARIFY_REGION";

/** BE `MoverAiSort` */
export type MoverAiSort = "rating" | "review" | "career" | "confirmed";

export type MoverAiClientActionType =
  | "SELECT_SERVICE"
  | "SELECT_SORT"
  | "SELECT_REGION"
  | "SHOW_MORE"
  | "CHANGE_FILTERS"
  | "FAVORITE_ALL";

export type MoverAiServiceCode = "SMALL" | "HOME" | "OFFICE";

export interface MoverAiFilters {
  region: string | null;
  service: string | null;
  sort: MoverAiSort | null;
}

export interface MoverAiChip {
  id: string;
  label: string;
  action: MoverAiClientActionType;
  value: string | null;
}

export interface MoverAiUi {
  nextAction: MoverAiNextAction;
  chips: MoverAiChip[] | null;
  movers: MoverListItem[] | null;
  listMeta: { nextCursor: string | null; hasNext: boolean } | null;
}

export interface MoverAiMessageView {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  ui?: MoverAiUi;
}

export interface MoverAiFavoriteResult {
  favoritedCount: number;
  skippedCount: number;
}

export interface MoverAiClientAction {
  type: MoverAiClientActionType;
  value?: string | null;
}

export interface CreateMoverAiSessionResult {
  sessionId: string;
  messages: MoverAiMessageView[];
}

export interface PostMoverAiMessageResult {
  sessionId: string;
  assistantMessage: MoverAiMessageView;
  filters: MoverAiFilters;
  favoriteResult?: MoverAiFavoriteResult;
}

export interface GetMoverAiSessionResult {
  sessionId: string;
  filters: MoverAiFilters;
  messages: MoverAiMessageView[];
}

/**
 * 기사님 AI 찾기 API — requireAuth + CUSTOMER.
 * cookieFetch로 쿠키·401 refresh를 태운다.
 */
export const moverAiService = {
  createSession: () =>
    cookieFetch<CreateMoverAiSessionResult>("/mover-ai/sessions", {
      method: "POST",
    }),

  getSession: (sessionId: string) =>
    cookieFetch<GetMoverAiSessionResult>(`/mover-ai/sessions/${sessionId}`),

  postMessage: (
    sessionId: string,
    body: { message: string; clientAction?: MoverAiClientAction | null }
  ) =>
    cookieFetch<PostMoverAiMessageResult>(`/mover-ai/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message: body.message,
        clientAction: body.clientAction ?? null,
      }),
    }),
};
