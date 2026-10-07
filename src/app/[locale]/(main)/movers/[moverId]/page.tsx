import { getTranslations } from "next-intl/server";
import { OG_FALLBACK_IMAGE } from "@/constants/site";
import type { Metadata } from "next";
import type { MoverDetail } from "@/lib/services/mover-service";
import MoverDetailClient from "./_components/MoverDetailClient";

type PageProps = {
  // `[locale]` 하위 라우트라 locale도 params로 들어옵니다 — 메타데이터 번역에 필요합니다
  params: Promise<{ locale: string; moverId: string }>;
};

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** OG용 — 서버에서 BE를 직접 호출 (상대 /api는 SSR에서 origin이 없음) */
async function fetchMoverForMeta(moverId: number): Promise<MoverDetail | null> {
  try {
    const res = await fetch(`${BACKEND_ORIGIN}/api/movers/${moverId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return null;
    }
    const json: unknown = await res.json();
    if (typeof json !== "object" || json === null || !("data" in json)) {
      return null;
    }
    return (json as { data: MoverDetail }).data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, moverId: rawId } = await params;
  const t = await getTranslations({ locale, namespace: "page" });
  const moverId = Number(rawId);
  if (!Number.isFinite(moverId) || moverId <= 0) {
    return { title: t("moverDetailMeta") };
  }

  const mover = await fetchMoverForMeta(moverId);
  if (!mover) {
    return { title: t("moverDetailMeta") };
  }

  const title = t("moverMetaTitle", { name: mover.nickName });
  const description = mover.bio || mover.description;
  // 프로필 사진이 없으면 og:image 자체가 빠져 밋밋한 카드로 공유됐습니다.
  // 사진을 안 올린 기사님이 적지 않아 브랜드 이미지로 폴백합니다.
  const images = [{ url: mover.image || OG_FALLBACK_IMAGE }];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function MoverDetailPage({ params }: PageProps) {
  await params;
  return <MoverDetailClient />;
}
