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

const REVIEW_CHIP_MAP = new Map(
  REVIEW_CHIP_GROUPS.flatMap((group) => group.chips).map((chip) => [chip.id, chip])
);

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
