import MoverMyQuotesTabs from "./_components/MoverMyQuotesTabs";

// 탭은 URL 쿼리(?tab=rejected)로 들고 있습니다. 상세에서 뒤로 가면 보던 탭으로 돌아와야
// 하는데 useState로만 두면 항상 첫 탭으로 초기화됩니다. 여기서 읽어 초기값으로 내려주면
// useSearchParams(+Suspense 경계)를 쓰지 않아도 됩니다.
//
// 역할·프로필 가드는 상위 레이아웃((protected)/mover/(with-profile))이 합니다.
export default async function MoverMyQuotesPage({ searchParams }: PageProps<"/mover/my-quotes">) {
  const { tab } = await searchParams;

  return <MoverMyQuotesTabs initialTab={tab === "rejected" ? "rejected" : "confirmed"} />;
}
