import type { AddressSelectResult } from "@/components/address/AddressSelectModal";

export async function searchAddress(query: string): Promise<AddressSelectResult[]> {
  const res = await fetch(`/api/kakao/address-search?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    return [];
  }

  const data: { results: AddressSelectResult[] } = await res.json();
  return data.results;
}
