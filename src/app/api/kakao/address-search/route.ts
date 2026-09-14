import { NextRequest, NextResponse } from "next/server";
import type { AddressSelectResult } from "@/components/address/AddressSelectModal";
import { REGION_LABELS, type RegionCode } from "@/components/filter/ChipRegion";

// 카카오 로컬 API 전용 프록시 — REST API 키를 클라이언트에 노출 안 하려고 서버에서만 호출한다.
// next.config.ts의 /api/:path* rewrite(백엔드 프록시)보다 파일시스템 라우트가 우선이라 충돌 없음.
const KAKAO_ADDRESS_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/address.json";
const KAKAO_FETCH_TIMEOUT_MS = 5000;

// ponytail: 인스턴스 로컬 메모리 카운터라 배포가 여러 인스턴스로 뜨면 IP별 한도가 인스턴스 수만큼 느슨해짐.
// 익명 남용으로 카카오 일일 쿼터가 실제로 고갈되면 공유 스토어(예: Upstash Redis) 기반으로 교체.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const requestTimestampsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestTimestampsByIp.get(ip) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestTimestampsByIp.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

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
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  const query = request.nextUrl.searchParams.get("query")?.trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "KAKAO_REST_API_KEY is not configured" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(`${KAKAO_ADDRESS_SEARCH_URL}?query=${encodeURIComponent(query)}`, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
      signal: AbortSignal.timeout(KAKAO_FETCH_TIMEOUT_MS),
    });
  } catch {
    // 타임아웃/네트워크 장애 — 카카오 쪽 문제로 검색 자체를 못 한 것이니 결과 없음으로 취급
    return NextResponse.json({ results: [] }, { status: 502 });
  }

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
