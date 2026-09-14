import { NextRequest, NextResponse } from "next/server";
import type { AddressSelectResult } from "@/components/address/AddressSelectModal";
import { REGION_LABELS, type RegionCode } from "@/components/filter/ChipRegion";

// 카카오 로컬 API 전용 프록시 — REST API 키를 클라이언트에 노출 안 하려고 서버에서만 호출한다.
// next.config.ts의 /api/:path* rewrite(백엔드 프록시)보다 파일시스템 라우트가 우선이라 충돌 없음.
const KAKAO_ADDRESS_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/address.json";

interface KakaoAddressDocument {
  address_name: string;
  x: string;
  y: string;
  address: { address_name: string; region_1depth_name: string } | null;
  road_address: { address_name: string; zone_no: string; region_1depth_name: string } | null;
}

// 카카오는 "강원특별자치도"처럼 최신 행정구역 명칭을 줄 수 있어서 완전일치 대신 접두어로 매칭한다.
function toRegionCode(region1depthName: string): RegionCode | null {
  const entry = Object.entries(REGION_LABELS).find(([, label]) =>
    region1depthName.startsWith(label)
  );
  return (entry?.[0] as RegionCode) ?? null;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "KAKAO_REST_API_KEY is not configured" }, { status: 500 });
  }

  const res = await fetch(`${KAKAO_ADDRESS_SEARCH_URL}?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });

  if (!res.ok) {
    return NextResponse.json({ results: [] }, { status: res.status });
  }

  const data: { documents: KakaoAddressDocument[] } = await res.json();

  const results: AddressSelectResult[] = data.documents
    .map((doc) => {
      // 견적 요청 제출엔 우편번호가 필수라, 도로명주소가 없거나(동 이름만 매칭) 건물번지 없이
      // 도로 이름만 매칭돼 우편번호가 비어 있는 결과(예: "강남대로")는 애초에 못 씀
      if (!doc.road_address || !doc.road_address.zone_no) return null;

      const region = toRegionCode(doc.road_address.region_1depth_name);
      if (!region) return null;

      return {
        id: `${doc.x}_${doc.y}`,
        zipCode: doc.road_address.zone_no,
        roadAddress: doc.road_address.address_name,
        lotAddress: doc.address?.address_name ?? doc.road_address.address_name,
        region,
      };
    })
    .filter((result) => result !== null);

  return NextResponse.json({ results });
}
