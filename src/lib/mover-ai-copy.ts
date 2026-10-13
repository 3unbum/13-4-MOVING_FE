import type {
  MoverAiChip,
  MoverAiMessageView,
  MoverAiNextAction,
  MoverAiSpeechTemplate,
} from "@/lib/services/mover-ai-service";

type CopyValues = Record<string, string | number>;

export type MoverAiTranslate = (key: string, values?: CopyValues) => string;

/** 칩은 서버 한국어 label 대신 action·value로 화면 문구를 고릅니다. 중의 지역만 label을 씁니다. */
export function moverAiChipLabel(
  chip: MoverAiChip,
  nextAction: MoverAiNextAction | undefined,
  t: MoverAiTranslate,
  tService: MoverAiTranslate
): string {
  if (chip.action === "SELECT_SERVICE" && chip.value) return tService(chip.value);
  if (chip.action === "SELECT_SORT" && chip.value) return t(`sort.${chip.value}`);
  if (chip.action === "SELECT_MODE") {
    return chip.value === "recommend" ? t("recommendChip") : t("browseChip");
  }
  if (chip.action === "SHOW_MORE") return t("showMoreChip");
  if (chip.action === "CHANGE_FILTERS") return t("changeFiltersChip");
  if (chip.action === "FAVORITE_ALL") {
    return nextAction === "SHOW_RECOMMENDATION" ? t("favoriteOneChip") : t("favoriteAllChip");
  }
  return chip.label;
}

const REVIEW_SUMMARY_MARKER = "\n리뷰 요약:";

/** 저장된 content에서 말풍선과 리뷰 요약 상자를 나눕니다. */
function splitStoredContent(content: string): {
  speech: string;
  reviewSummary: string | null;
} {
  const index = content.indexOf(REVIEW_SUMMARY_MARKER);
  if (index === -1) return { speech: content, reviewSummary: null };
  const reviewSummary = content.slice(index + REVIEW_SUMMARY_MARKER.length).trim();
  return {
    speech: content.slice(0, index),
    reviewSummary: reviewSummary || null,
  };
}

function templateLine(
  template: MoverAiSpeechTemplate,
  message: MoverAiMessageView,
  t: MoverAiTranslate
): string {
  const mover = message.ui?.movers?.[0];
  if (template === "recommend" || template === "recommendOnly") {
    // 카드가 없으면 composeAssistantSpeech가 content로 폴백합니다.
    if (!mover) return "";
    const nick = mover.nickName;
    const stats = t("stats", {
      rating: Number(mover.avgRating).toFixed(1),
      reviews: mover.reviewCount,
      career: mover.career,
      confirmed: mover.confirmedCount,
    });
    const intro =
      template === "recommendOnly" ? t("onlyIntro", { nick }) : t("recommendIntro", { nick });
    const reason = template === "recommendOnly" ? t("onlyReason") : t("rankReason");
    return `${intro}\n${reason}\n${stats}`;
  }
  if (template === "clarifyRegion") {
    const places = (message.ui?.chips ?? []).map((chip) => `**${chip.label}**`).join(", ");
    return t("clarifyRegion", { places });
  }
  if (template === "favoriteCreated" || template === "favoritePartial") {
    return t(template, { count: message.ui?.speech?.favoriteCount ?? 0 });
  }
  return t(template);
}

/** speech가 없는 예전 메시지는 저장된 한국어 content를 그대로 씁니다. */
export function composeAssistantSpeech(
  message: MoverAiMessageView,
  t: MoverAiTranslate
): { speech: string; reviewSummary: string | null } {
  const meta = message.ui?.speech;
  if (!meta) return splitStoredContent(message.content);

  if (meta.source === "model") {
    const body = meta.modelReply ?? message.content;
    return {
      speech: meta.unsupported ? `${t("unsupported")}\n${body}` : body,
      reviewSummary: null,
    };
  }

  // 탈퇴 등으로 추천 카드가 빠지면 통계를 0으로 만들지 않고 저장 문구를 씁니다.
  const isRecommend = meta.template === "recommend" || meta.template === "recommendOnly";
  if (isRecommend && !message.ui?.movers?.[0]) {
    const stored = splitStoredContent(message.content);
    return {
      speech: stored.speech,
      // 상자용 요약은 화면 언어로 저장된 값을 우선하고, 없으면 content에서 분리한 값을 씁니다.
      reviewSummary: meta.reviewSummaryState === "text" ? meta.reviewSummary : stored.reviewSummary,
    };
  }

  const parts: string[] = [];
  if (meta.unsupported) parts.push(t("unsupported"));
  if (meta.template) {
    const line = templateLine(meta.template, message, t);
    if (line) parts.push(line);
  }
  if (meta.ask) parts.push(templateLine(meta.ask, message, t));
  if (meta.closed) {
    const count = message.ui?.movers?.length ?? 0;
    parts.push(count === 1 ? t("lastOne") : t("lastMany"));
  }
  if (meta.reviewSummaryState === "none") parts.push(t("noConfirmedReviews"));
  if (meta.reviewSummaryState === "failed") parts.push(t("summarySkipped"));

  return {
    speech: parts.join("\n"),
    reviewSummary: meta.reviewSummaryState === "text" ? meta.reviewSummary : null,
  };
}
