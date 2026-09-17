import type { Metadata } from "next";
import type { MoverDetail } from "@/lib/services/mover-service";
import MoverDetailClient from "./_components/MoverDetailClient";

type PageProps = {
  params: Promise<{ moverId: string }>;
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
  const { moverId: rawId } = await params;
  const moverId = Number(rawId);
  if (!Number.isFinite(moverId) || moverId <= 0) {
    return { title: "기사님 상세 | 무빙" };
  }

  const mover = await fetchMoverForMeta(moverId);
  if (!mover) {
    return { title: "기사님 상세 | 무빙" };
  }

  const title = `${mover.nickName} 기사님 | 무빙`;
  const description = mover.bio || mover.description;
  const images = mover.image ? [{ url: mover.image }] : undefined;

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
      images: mover.image ? [mover.image] : undefined,
    },
  };
}

export default async function MoverDetailPage({ params }: PageProps) {
  await params;
  return <MoverDetailClient />;
}
