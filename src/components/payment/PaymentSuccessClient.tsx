"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import { useRouter } from "@/i18n/navigation";
import { usePayEstimate } from "@/hooks/usePayment";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { paymentTypeOfOrderId } from "@/lib/services/estimate-service";
import { ApiError } from "@/lib/utils/api-error";

interface PaymentSuccessClientProps {
  estimateId: number;
  /** 토스 결제창이 successUrl 쿼리로 돌려준 값 — BE가 토스에 승인을 요청합니다 */
  paymentKey: string;
  orderId: string;
  amount: number;
}

function ResultLayout({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-6">
      <div className="flex w-full max-w-81.75 flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-20 text-black-500 font-bold">{title}</h1>
          {body && <p className="text-14 text-gray-gray-400 font-medium">{body}</p>}
        </div>
        <div className="flex w-full flex-col gap-3">{children}</div>
      </div>
    </main>
  );
}

/**
 * 토스 결제 성공 후 돌아오는 화면 — 여기서 BE에 승인을 요청합니다.
 *
 * 토스의 성공 리다이렉트만으로는 결제가 끝난 게 아닙니다. 서버가 승인 API를 호출해야
 * 돈이 움직이므로(승인 전에는 자동 취소됩니다), 화면이 열리면 한 번만 요청합니다.
 *
 * 선수금인지 잔금인지는 주문 번호(`moving-deposit-…` / `moving-balance-…`)에서 되읽습니다.
 * 선수금이면 이사가 확정되고 채팅방이 열리므로, 안내 문구와 이동 위치가 잔금과 다릅니다.
 *
 * 새로고침하면 같은 요청이 다시 나가 BE가 `ALREADY_PAID`로 거절합니다. 이미 결제가 끝난 것이므로
 * 오류가 아니라 "이미 결제한 견적"으로 안내합니다.
 */
export default function PaymentSuccessClient({
  estimateId,
  paymentKey,
  orderId,
  amount,
}: PaymentSuccessClientProps) {
  const t = useTranslations("payment");
  const tAuthError = useTranslations("authError");
  const router = useRouter();
  const { mutate, isPending, isSuccess, error } = usePayEstimate(estimateId);
  const requested = useRef(false);
  const type = paymentTypeOfOrderId(orderId);

  // StrictMode가 effect를 두 번 돌려도 승인 요청은 한 번만 보냅니다
  useEffect(() => {
    if (requested.current || type === null) return;
    requested.current = true;
    mutate({ type, paymentKey, orderId, amount });
  }, [mutate, type, paymentKey, orderId, amount]);

  const goHistory = () => router.replace("/customer/my-quotes?tab=payHistory");
  const goPayPending = () => router.replace("/customer/my-quotes?tab=payPending");
  // 선수금을 내면 이사가 확정됩니다 — 확정된 견적은 받았던 견적 탭에 있습니다
  const goQuotes = () => router.replace("/customer/my-quotes?tab=past");

  // 우리 주문 번호 규칙이 아니면 승인 요청을 보내지 않습니다
  if (type === null) {
    return (
      <ResultLayout title={t("failTitle")} body={t("confirmFailed")}>
        <Button size="md" onClick={goPayPending}>
          {t("goPayPending")}
        </Button>
      </ResultLayout>
    );
  }

  if (isSuccess) {
    return type === "DEPOSIT" ? (
      <ResultLayout title={t("depositSuccessTitle")} body={t("depositSuccessBody")}>
        <Button size="md" onClick={goQuotes}>
          {t("goQuotes")}
        </Button>
      </ResultLayout>
    ) : (
      <ResultLayout title={t("successTitle")} body={t("successBody")}>
        <Button size="md" onClick={goHistory}>
          {t("goHistory")}
        </Button>
      </ResultLayout>
    );
  }

  if (error) {
    const isAlreadyPaid = error instanceof ApiError && error.code === "ALREADY_PAID";

    return (
      <ResultLayout
        title={isAlreadyPaid ? t("alreadyPaid") : t("failTitle")}
        body={isAlreadyPaid ? undefined : toAuthErrorMessage(error, tAuthError, t("confirmFailed"))}
      >
        <Button
          size="md"
          onClick={isAlreadyPaid ? (type === "DEPOSIT" ? goQuotes : goHistory) : goPayPending}
        >
          {isAlreadyPaid
            ? type === "DEPOSIT"
              ? t("goQuotes")
              : t("goHistory")
            : t("goPayPending")}
        </Button>
      </ResultLayout>
    );
  }

  // 승인 요청 중(isPending)이거나 effect가 돌기 전 — 둘 다 "확인 중"으로 보입니다
  return (
    <main
      role="status"
      aria-busy={isPending}
      className="text-14 text-gray-gray-400 flex min-h-dvh items-center justify-center bg-gray-50 px-6"
    >
      {t("confirming")}
    </main>
  );
}
