import { SERVICE_LABELS, type ServiceCode } from "@/components/filter/ChipRegion";
import type { FavoriteMoverCard } from "@/lib/services/favorite-service";
import type { MoverListItem } from "@/lib/services/mover-service";

function isServiceCode(value: string): value is ServiceCode {
  return value in SERVICE_LABELS;
}

/**
 * MoveTypeChip은 ServiceCode만 받음.
 * 목록 API는 한글("소형이사"), 찜 API는 enum("SMALL") — 둘 다 코드로 통일.
 */
function toServiceCode(value: string | undefined): ServiceCode {
  if (!value) {
    return "SMALL";
  }
  if (isServiceCode(value)) {
    return value;
  }
  const found = (Object.entries(SERVICE_LABELS) as [ServiceCode, string][]).find(
    ([, korean]) => korean === value
  );
  return found?.[0] ?? "SMALL";
}

/** 목록 DTO → CardMover. 제목=bio, 부제=description */
export function mapMoverListItemToCard(item: MoverListItem) {
  return {
    id: item.id,
    categories: item.services.map(toServiceCode),
    title: item.bio,
    description: item.description,
    nickName: item.nickName,
    profileImage: item.image,
    rating: item.avgRating,
    reviewCount: item.reviewCount,
    career: item.career,
    confirmedCount: item.confirmedCount,
    favoriteCount: item.favoriteCount,
  };
}

/** 찜 사이드바 DTO → CardMover */
export function mapFavoriteCardToCard(item: FavoriteMoverCard) {
  return {
    id: item.id,
    categories: item.services.map(toServiceCode),
    title: item.bio,
    nickName: item.nickName,
    profileImage: item.image,
    rating: item.avgRating,
    reviewCount: item.reviewCount,
    career: item.career,
    confirmedCount: item.confirmedCount,
    favoriteCount: item.favoriteCount,
    isFavorited: true as const,
  };
}
