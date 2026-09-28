import QuoteShare from "@/components/quote/QuoteShare";

export default function QuoteSharePreviewPage() {
  return (
    <div className="my-6 flex flex-col gap-10 px-24 py-12">
      <QuoteShare title="견적서 공유하기" moverId={1} moverNickName="송기사닉네임" />
      <QuoteShare
        title="나만 알기엔 아쉬운 기사님인가요?"
        moverId={1}
        moverNickName="송기사닉네임"
      />
    </div>
  );
}
