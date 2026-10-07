import type { AddressSelectResult } from "@/components/address/AddressSelectModal";

export interface AddressSearchPage {
  results: AddressSelectResult[];
  hasMore: boolean;
  // 서버가 정한 검색 방식 — 다음 페이지 요청에 그대로 돌려보낸다
  mode?: string;
}

const EMPTY_PAGE: AddressSearchPage = { results: [], hasMore: false };

// signal은 useAddressSearch가 최신 검색어 요청만 남기고 이전 요청을 취소하는 데 씀
export async function searchAddress(
  query: string,
  {
    page = 1,
    mode,
    locale,
    signal,
  }: { page?: number; mode?: string; locale?: string; signal?: AbortSignal } = {}
): Promise<AddressSearchPage> {
  try {
    const params = new URLSearchParams({ query, page: String(page) });
    // 한자만 쓴 일본어·중국어 입력을 가를 때 서버가 UI 언어를 참고한다
    if (locale) params.set("locale", locale);
    if (mode) params.set("mode", mode);
    const res = await fetch(`/api/kakao/address-search?${params}`, { signal });
    if (!res.ok) {
      return EMPTY_PAGE;
    }

    return await res.json();
  } catch (error) {
    // 취소는 호출한 쪽(useAddressSearch)이 "무시" 신호로 구분해야 하니 그대로 던진다
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    // 그 외(네트워크 오류·JSON 파싱 실패 등)는 결과 없음으로 취급
    return EMPTY_PAGE;
  }
}

// 고른 항목의 지번 라벨 — 목록 전체가 아니라 선택한 1건만 구글에 물어 호출 수를 줄인다
export async function fetchLotLabel(
  query: string,
  result: AddressSelectResult,
  locale?: string
): Promise<string | undefined> {
  try {
    const params = new URLSearchParams({ query, lot: result.lotAddress, region: result.region });
    if (locale) params.set("locale", locale);
    const res = await fetch(`/api/kakao/address-search?${params}`);
    if (!res.ok) return undefined;
    return ((await res.json()) as { lotLabel: string | null }).lotLabel ?? undefined;
  } catch {
    return undefined;
  }
}
