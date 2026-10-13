/**
 * 리뷰 키워드 칩 — **한국어 전용 기능**입니다.
 *
 * 칩을 고르면 `mid`/`end`를 이어 붙여 후기 문장을 자동 생성하는데(`~하고, ~하고, ~했어요`),
 * 이 조합 규칙이 **한국어 연결어미에 묶여 있습니다.** 영어는 `and`가 마지막 항목 앞에만
 * 오고, 일본어는 `~て`, 중국어는 또 다른 방식이라 문자열만 번역해서는 성립하지 않습니다.
 *
 * 요구사항이 아니라 추가 개발 항목이고(팀 논의 2026-09-30), 한국 이사업체 후기를
 * 외국어로 칩 작성하는 경우는 드물어 **다른 로케일에서는 칩 섹션을 숨깁니다.**
 * 직접 입력은 모든 언어에서 그대로 됩니다 — `ReviewWriteModal` 참고.
 *
 * 언어별 조합 규칙을 만들려면 `buildReviewFromChips`를 로케일 분기로 바꿔야 합니다.
 */
export const MAX_REVIEW_CHIPS = 4;

export interface ReviewChip {
  id: string;
  emoji: string;
  label: string;
  /** 앞에 올 때: '~하고' */
  mid: string;
  /** 마지막에 올 때: '~했어요' */
  end: string;
}

export interface ReviewChipGroup {
  category: string;
  chips: ReviewChip[];
}

export const REVIEW_CHIP_GROUPS: ReviewChipGroup[] = [
  {
    category: "서비스",
    chips: [
      {
        id: "kind",
        emoji: "🤝",
        label: "친절해요",
        mid: "기사님이 친절하시고",
        end: "기사님이 친절하셨어요",
      },
      {
        id: "fast-contact",
        emoji: "📞",
        label: "연락이 빨라요",
        mid: "연락이 빠르고",
        end: "연락이 빨랐어요",
      },
      {
        id: "detailed",
        emoji: "💬",
        label: "설명이 자세해요",
        mid: "설명이 자세하고",
        end: "설명이 자세했어요",
      },
      {
        id: "quick-response",
        emoji: "⚡",
        label: "응대가 신속해요",
        mid: "응대가 신속하고",
        end: "응대가 신속했어요",
      },
    ],
  },
  {
    category: "이사",
    chips: [
      {
        id: "careful-pack",
        emoji: "📦",
        label: "포장이 꼼꼼해요",
        mid: "짐 포장이 꼼꼼하고",
        end: "짐 포장이 꼼꼼했어요",
      },
      {
        id: "no-damage",
        emoji: "🛡️",
        label: "파손이 없어요",
        mid: "짐 파손 없이 안전하게 옮겨 주시고",
        end: "짐 파손 없이 안전하게 옮겨 주셨어요",
      },
      {
        id: "on-time",
        emoji: "⏰",
        label: "시간 약속을 잘 지켜요",
        mid: "시간 약속도 잘 지켜 주시고",
        end: "시간 약속도 잘 지켜 주셨어요",
      },
      {
        id: "organize",
        emoji: "🏠",
        label: "짐 정리를 잘 해줘요",
        mid: "도착 후 짐 정리까지 잘 도와주시고",
        end: "도착 후 짐 정리까지 잘 도와주셨어요",
      },
    ],
  },
  {
    category: "가격/기타",
    chips: [
      {
        id: "fair-price",
        emoji: "💰",
        label: "가격이 합리적이에요",
        mid: "가격이 합리적이고",
        end: "가격이 합리적이었어요",
      },
      {
        id: "no-extra-fee",
        emoji: "🧾",
        label: "추가 비용이 없어요",
        mid: "추가 비용 없이 견적 그대로 진행됐고",
        end: "추가 비용 없이 견적 그대로 진행됐어요",
      },
      {
        id: "clean-truck",
        emoji: "🚚",
        label: "차량이 깨끗해요",
        mid: "차량이 깨끗하고",
        end: "차량이 깨끗했어요",
      },
      {
        id: "aftercare",
        emoji: "🔧",
        label: "사후 관리가 좋아요",
        mid: "이사 후에도 잘 챙겨 주시고",
        end: "이사 후에도 잘 챙겨 주셨어요",
      },
    ],
  },
];

const ALL_REVIEW_CHIPS = REVIEW_CHIP_GROUPS.flatMap((group) => group.chips);

const REVIEW_CHIP_MAP = new Map(ALL_REVIEW_CHIPS.map((chip) => [chip.id, chip]));
const REVIEW_CHIP_BY_MID = new Map(ALL_REVIEW_CHIPS.map((chip) => [chip.mid, chip.id]));
const REVIEW_CHIP_BY_END = new Map(ALL_REVIEW_CHIPS.map((chip) => [chip.end, chip.id]));

// 선택한 순서대로 한 문장으로 이어 붙인다. 마지막만 '~했어요'로 닫는다.
export function buildReviewFromChips(selectedIds: string[]): string {
  const chips = selectedIds
    .map((id) => REVIEW_CHIP_MAP.get(id))
    .filter((chip): chip is ReviewChip => Boolean(chip));

  if (chips.length === 0) return "";
  if (chips.length === 1) return `${chips[0].end}.`;

  const head = chips.slice(0, -1).map((chip) => chip.mid);
  const last = chips[chips.length - 1].end;
  return `${head.join(", ")}, ${last}.`;
}

// 칩으로 만든 문장만 다시 칩 id로 되돌린다. 직접 고친 문장은 빈 배열이다.
export function parseReviewChips(review: string): string[] {
  const text = review.trim();
  if (!text.endsWith(".")) return [];

  const parts = text.slice(0, -1).split(", ");
  if (parts.length === 0 || parts.length > MAX_REVIEW_CHIPS) return [];

  const ids: string[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < parts.length - 1; index += 1) {
    const id = REVIEW_CHIP_BY_MID.get(parts[index]);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    ids.push(id);
  }

  const lastId = REVIEW_CHIP_BY_END.get(parts[parts.length - 1]);
  if (!lastId || seen.has(lastId)) return [];
  ids.push(lastId);

  return buildReviewFromChips(ids) === text ? ids : [];
}
