import { NextRequest, NextResponse } from "next/server";
import type { AddressSelectResult } from "@/components/address/AddressSelectModal";
import { REGION_LABELS, type RegionCode } from "@/components/filter/ChipRegion";

// 카카오 로컬 API 전용 프록시 — REST API 키를 클라이언트에 노출 안 하려고 서버에서만 호출한다.
// next.config.ts의 /api/:path* rewrite(백엔드 프록시)보다 파일시스템 라우트가 우선이라 충돌 없음.
const KAKAO_ADDRESS_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/address.json";
const KAKAO_KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const PAGE_SIZE = 10;
const KAKAO_FETCH_TIMEOUT_MS = 5000;

// 인스턴스 로컬 메모리 카운터라 배포가 여러 인스턴스로 뜨면 IP별 한도가 인스턴스 수만큼 느슨해짐.
// 익명 남용으로 카카오 일일 쿼터가 실제로 고갈되면 공유 스토어(예: Upstash Redis) 기반으로 교체.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const requestTimestampsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestTimestampsByIp.get(ip) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestTimestampsByIp.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  requestTimestampsByIp.set(ip, timestamps);
  return false;
}

interface KakaoAddressDocument {
  address_name: string;
  road_address_name?: string; // 키워드 검색 응답에만 있음
  x: string;
  y: string;
  address: { address_name: string; region_1depth_name: string } | null;
  road_address: { address_name: string; zone_no: string; region_1depth_name: string } | null;
}

// 카카오는 "강원특별자치도"처럼 최신 행정구역 명칭을 줄 수 있어서 완전일치 대신 접두어로 매칭한다.
//
// ⚠️ 여기서 쓰는 REGION_LABELS는 **번역하면 안 된다.** 카카오가 한국어로만 주는
// region_1depth_name과 문자열을 맞대보는 파싱용이라, 영어로 바뀌면 매칭이 전부 실패해
// 지역 코드가 null이 된다(주소 검색 결과의 지역 칩이 사라진다).
// 표시용 지역명은 messages/*.json의 `region` 네임스페이스를 쓴다.
function toRegionCode(region1depthName: string): RegionCode | null {
  const entry = Object.entries(REGION_LABELS).find(([, label]) =>
    region1depthName.startsWith(label)
  );
  return (entry?.[0] as RegionCode) ?? null;
}

class KakaoError extends Error {
  constructor(readonly status: number) {
    super(`Kakao API ${status}`);
  }
}

function toResults(documents: KakaoAddressDocument[]): AddressSelectResult[] {
  const seen = new Set<string>();
  return documents
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
    .filter((result) => result !== null)
    .filter((result) => !seen.has(result.id) && !!seen.add(result.id));
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  const params = request.nextUrl.searchParams;
  const query = params.get("query")?.trim();
  if (!query) {
    return NextResponse.json({ results: [], hasMore: false });
  }
  const page = Math.max(1, Number(params.get("page")) || 1);
  // 첫 페이지에서 정한 검색 방식을 다음 페이지에도 유지하려고 클라이언트가 mode를 되돌려 보낸다
  let mode: "address" | "keyword" = params.get("mode") === "keyword" ? "keyword" : "address";

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "KAKAO_REST_API_KEY is not configured" }, { status: 500 });
  }

  const fetchKakao = async (url: string, q: string, pageNo: number, size: number) => {
    const res = await fetch(`${url}?query=${encodeURIComponent(q)}&page=${pageNo}&size=${size}`, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
      signal: AbortSignal.timeout(KAKAO_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new KakaoError(res.status);
    return (await res.json()) as { documents: KakaoAddressDocument[]; meta: { is_end: boolean } };
  };

  // 주소 검색은 정확한 주소만 매칭해서, 건물명/장소명/도로명 일부 같은 부분 입력은 빈 배열이 된다.
  // 첫 페이지가 비면 키워드 검색으로 후보 장소를 찾고, 그 도로명주소를 다시 주소 검색에 넣어 우편번호를 채운다.
  const searchByKeyword = async () => {
    const { documents: places, meta } = await fetchKakao(
      KAKAO_KEYWORD_SEARCH_URL,
      query,
      page,
      PAGE_SIZE
    );
    const roadNames = [
      ...new Set(places.map((p) => p.road_address_name).filter((n): n is string => !!n)),
    ];
    const documents = (
      await Promise.all(roadNames.map((n) => fetchKakao(KAKAO_ADDRESS_SEARCH_URL, n, 1, 1)))
    ).flatMap((r) => r.documents);
    return { documents, hasMore: !meta.is_end };
  };

  try {
    let found: { documents: KakaoAddressDocument[]; hasMore: boolean };
    if (mode === "keyword") {
      found = await searchByKeyword();
    } else {
      const { documents, meta } = await fetchKakao(
        KAKAO_ADDRESS_SEARCH_URL,
        query,
        page,
        PAGE_SIZE
      );
      found = { documents, hasMore: !meta.is_end };
      if (page === 1 && !toResults(documents).length) {
        mode = "keyword";
        found = await searchByKeyword();
      }
    }
    return NextResponse.json({ results: toResults(found.documents), hasMore: found.hasMore, mode });
  } catch (error) {
    // 타임아웃/네트워크 장애 — 카카오 쪽 문제로 검색 자체를 못 한 것이니 결과 없음으로 취급
    return NextResponse.json(
      { results: [], hasMore: false },
      { status: error instanceof KakaoError ? error.status : 502 }
    );
  }
}
