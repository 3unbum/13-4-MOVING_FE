"use client";

import { useEffect, useState } from "react";
import { useConfirmEstimate, useQuoteDetail } from "@/hooks/useQuoteDetail";
import { useFavoriteMover } from "@/hooks/useFavoriteMover";
import QuoteDetailView from "@/components/quote/QuoteDetailView";
import Toast from "@/components/common/Toast";
import Loading from "@/app/loading";
import { ApiError } from "@/lib/utils/api-error";

interface QuoteDetailClientProps {
  estimateId: number;
}

/** 토스트 노출 시간 — QuoteShare와 같은 값입니다 */
const TOAST_DURATION_MS = 3000;

function DetailMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-14 text-gray-gray-400 flex min-h-dvh items-center justify-center bg-gray-50 px-6">
      {children}
    </div>
  );
}

export default function QuoteDetailClient({ estimateId }: QuoteDetailClientProps) {
  const { estimate, request, isLoading, error } = useQuoteDetail(estimateId);
  const [toast, setToast] = useState<string | null>(null);

  // 확정 실패를 알려줍니다. 안 띄우면 버튼만 다시 활성화돼 아무 일도 안 일어난 것처럼 보입니다.
  // BE 메시지("이미 처리된 견적입니다" 등)가 그대로 사용자용이라 있으면 그대로 씁니다.
  const confirm = useConfirmEstimate(estimateId, request?.id, (confirmError) => {
    setToast(
      confirmError instanceof ApiError
        ? confirmError.message
        : "견적 확정에 실패했어요. 잠시 후 다시 시도해 주세요."
    );
  });

  // 토스트는 일정 시간 뒤 스스로 사라집니다 (QuoteShare와 같은 방식)
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  if (error) {
    return <DetailMessage>견적을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</DetailMessage>;
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (!estimate || !request) {
    return <DetailMessage>견적을 찾을 수 없어요.</DetailMessage>;
  }

  return (
    <>
      <QuoteDetailBody
        estimate={estimate}
        request={request}
        onConfirm={() => confirm.mutate()}
        isConfirming={confirm.isPending}
      />
      {toast && <Toast message={toast} />}
    </>
  );
}

/**
 * 찜 훅이 `moverId`를 요구해서 견적을 받은 뒤에야 부를 수 있습니다.
 * 훅은 조건부로 호출할 수 없으므로 로딩·에러 분기 아래쪽을 별도 컴포넌트로 뺐습니다.
 */
function QuoteDetailBody({
  estimate,
  request,
  onConfirm,
  isConfirming,
}: {
  estimate: NonNullable<ReturnType<typeof useQuoteDetail>["estimate"]>;
  request: NonNullable<ReturnType<typeof useQuoteDetail>["request"]>;
  onConfirm: () => void;
  isConfirming: boolean;
}) {
  const favorite = useFavoriteMover(estimate.mover.id);

  return (
    <QuoteDetailView
      estimate={estimate}
      request={request}
      onConfirm={onConfirm}
      isConfirming={isConfirming}
      isFavorited={favorite.isFavorited}
      onToggleFavorite={favorite.toggle}
      isTogglingFavorite={favorite.isToggling}
    />
  );
}
