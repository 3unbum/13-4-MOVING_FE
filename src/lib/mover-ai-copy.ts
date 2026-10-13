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

function templateLine(
  template: MoverAiSpeechTemplate,
  message: MoverAiMessageView,
  t: MoverAiTranslate
): string {
  const mover = message.ui?.movers?.[0];
  if (template === "recommend" || template === "recommendOnly") {
    const nick = mover?.nickName ?? "";
    const stats = t("stats", {
      rating: Number(mover?.avgRating ?? 0).toFixed(1),
      reviews: mover?.reviewCount ?? 0,
      career: mover?.career ?? 0,
      confirmed: mover?.confirmedCount ?? 0,
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
  if (!meta) {
    const marker = "\n리뷰 요약:";
    const index = message.content.indexOf(marker);
    if (index === -1) return { speech: message.content, reviewSummary: null };
    const reviewSummary = message.content.slice(index + marker.length).trim();
    return {
      speech: message.content.slice(0, index),
      reviewSummary: reviewSummary || null,
    };
  }

  if (meta.source === "model") {
    const body = meta.modelReply ?? message.content;
    return {
      speech: meta.unsupported ? `${t("unsupported")}\n${body}` : body,
      reviewSummary: null,
    };
  }

  const parts: string[] = [];
  if (meta.unsupported) parts.push(t("unsupported"));
  if (meta.template) parts.push(templateLine(meta.template, message, t));
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
