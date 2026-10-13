import { cookieFetch } from "@/lib/utils/api-client";
import type { MoverListItem } from "@/lib/services/mover-service";

/** BE `MoverAiNextAction` */
export type MoverAiNextAction =
  | "ASK_REGION"
  | "ASK_SERVICE"
  | "ASK_MODE"
  | "ASK_SORT"
  | "SHOW_MOVERS"
  | "SHOW_RECOMMENDATION"
  | "CLARIFY_UNSUPPORTED"
  | "CLARIFY_REGION";

/** BE `MoverAiSort` */
export type MoverAiSort = "rating" | "review" | "career" | "confirmed";

export type MoverAiLocale = "ko" | "en" | "zh" | "ja";

export type MoverAiSpeechTemplate =
  | "welcome"
  | "askRegion"
  | "askRegionNext"
  | "askService"
  | "askServiceNext"
  | "askMode"
  | "askSort"
  | "showMovers"
  | "showMoversMore"
  | "showMoversEmpty"
  | "recommend"
  | "recommendOnly"
  | "noMover"
  | "clarifyRegion"
  | "changeFilters"
  | "resetRegion"
  | "resetService"
  | "favoriteCreated"
  | "favoriteAlready"
  | "favoritePartial"
  | "favoriteOne"
  | "favoriteOneAlready"
  | "geminiFallback"
  | "lastMovers";

export interface MoverAiSpeech {
  source: "template" | "model";
  template: MoverAiSpeechTemplate | null;
  ask: MoverAiSpeechTemplate | null;
  unsupported: boolean;
  closed: boolean;
  modelReply: string | null;
  reviewSummary: string | null;
  reviewSummaryState: "text" | "none" | "failed" | null;
  favoriteCount: number | null;
}

export type MoverAiClientActionType =
  | "SELECT_SERVICE"
  | "SELECT_SORT"
  | "SELECT_REGION"
  | "SELECT_MODE"
  | "COMPARE_OTHERS"
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
  /** 없으면 저장된 content를 그대로 보여 줍니다 */
  speech?: MoverAiSpeech | null;
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
    body: {
      message: string;
      clientAction?: MoverAiClientAction | null;
      locale?: MoverAiLocale;
    }
  ) =>
    cookieFetch<PostMoverAiMessageResult>(`/mover-ai/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message: body.message,
        clientAction: body.clientAction ?? null,
        locale: body.locale ?? "ko",
      }),
    }),
};
