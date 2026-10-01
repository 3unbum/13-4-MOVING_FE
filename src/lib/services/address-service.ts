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
  { page = 1, mode, signal }: { page?: number; mode?: string; signal?: AbortSignal } = {}
): Promise<AddressSearchPage> {
  try {
    const params = new URLSearchParams({ query, page: String(page) });
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
