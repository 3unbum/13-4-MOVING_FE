import type { AddressSelectResult } from "@/components/address/AddressSelectModal";

// signal은 useAddressSearch가 최신 검색어 요청만 남기고 이전 요청을 취소하는 데 씀
export async function searchAddress(
  query: string,
  signal?: AbortSignal
): Promise<AddressSelectResult[]> {
  try {
    const res = await fetch(`/api/kakao/address-search?query=${encodeURIComponent(query)}`, {
      signal,
    });
    if (!res.ok) {
      return [];
    }

    const data: { results: AddressSelectResult[] } = await res.json();
    return data.results;
  } catch (error) {
    // 취소는 호출한 쪽(useAddressSearch)이 "무시" 신호로 구분해야 하니 그대로 던진다
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    // 그 외(네트워크 오류·JSON 파싱 실패 등)는 결과 없음으로 취급
    return [];
  }
}
