"use client";

import { useConfirmEstimate, useQuoteDetail } from "@/hooks/useQuoteDetail";
import QuoteDetailView from "@/components/quote/QuoteDetailView";

interface QuoteDetailClientProps {
  estimateId: number;
}

function DetailMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-background-100 text-14 text-gray-gray-400 flex min-h-dvh items-center justify-center px-6">
      {children}
    </div>
  );
}

export default function QuoteDetailClient({ estimateId }: QuoteDetailClientProps) {
  const { estimate, request, isLoading, error } = useQuoteDetail(estimateId);
  const confirm = useConfirmEstimate(estimateId);

  if (error) {
    return <DetailMessage>견적을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</DetailMessage>;
  }

  if (isLoading) {
    return <div className="bg-background-background-100 min-h-dvh" aria-busy="true" />;
  }

  if (!estimate || !request) {
    return <DetailMessage>견적을 찾을 수 없어요.</DetailMessage>;
  }

  return (
    <QuoteDetailView
      estimate={estimate}
      request={request}
      onConfirm={() => confirm.mutate()}
      isConfirming={confirm.isPending}
    />
  );
}
