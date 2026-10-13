import { notFound } from "next/navigation";

// 매칭 안 되는 URL을 [locale]/not-found.tsx 로 보내는 catch-all.
// 없으면 루트 not-found가 없어 Next 기본 404가 뜬다.
export default function CatchAll() {
  notFound();
}
