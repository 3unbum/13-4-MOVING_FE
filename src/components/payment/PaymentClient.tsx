"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  ANONYMOUS,
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import Loading from "@/app/[locale]/loading";
import Button from "@/components/common/Button";
import Toast from "@/components/common/Toast";
import { useRouter } from "@/i18n/navigation";
import { quoteDetailKeys } from "@/hooks/useQuoteDetail";
import {
  estimateService,
  extraChargesByStatus,
  paymentTypeOfStage,
  sumExtraCharges,
  toPaymentOrderId,
} from "@/lib/services/estimate-service";
import { formatDueDateTime, type DateLocale } from "@/lib/utils/date";

interface PaymentClientProps {
  estimateId: number;
}

/** 토스 개발자센터의 결제위젯 연동 **클라이언트 키**(`test_gck_…`). 시크릿 키는 BE에만 둡니다 */
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

const PAYMENT_METHOD_ID = "toss-payment-method";
const AGREEMENT_ID = "toss-agreement";

/** 토스트 노출 시간 — QuoteDetailClient와 같은 값입니다 */
const TOAST_DURATION_MS = 3000;

function PaymentMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-14 text-gray-gray-400 flex min-h-dvh items-center justify-center bg-gray-50 px-6">
      {children}
    </div>
  );
}

/**
 * 견적 결제 화면 — 토스페이먼츠 결제위젯. 선수금(확정 후)과 잔금(이사 완료 후)을 모두 여기서 냅니다.
 *
 * 어떤 결제인지는 BE가 내려주는 결제 단계(`paymentStage`)로 정합니다 — 선수금 대기면 선수금,
 * 잔금 대기면 잔금입니다. 금액도 BE가 계산한 값(`depositAmount` / `balanceAmount`)을 씁니다.
 *
 * 흐름: 이 화면에서 결제 수단을 고르고 "결제하기" → 토스 결제창 → 성공하면 `…/success`로
 * `paymentKey`·`orderId`·`amount`와 함께 돌아옵니다. 실제 승인은 그 화면이 BE에 요청합니다.
 *
 * 금액과 주문 번호(`toPaymentOrderId`)는 BE가 같은 값으로 다시 검증합니다. 여기서 바꿔도
 * 승인되지 않습니다. 테스트 키(`test_…`)를 쓰면 실제 청구는 일어나지 않습니다.
 */
export default function PaymentClient({ estimateId }: PaymentClientProps) {
  const t = useTranslations("payment");
  const tCommon = useTranslations("common");
  const locale = useLocale() as DateLocale;
  const router = useRouter();
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isWidgetFailed, setIsWidgetFailed] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // 렌더 중에 Date.now()를 부르지 않도록 화면이 열린 시각을 한 번만 잡습니다
  const [openedAt] = useState(() => Date.now());

  const {
    data: estimate,
    isPending,
    error,
  } = useQuery({
    queryKey: quoteDetailKeys.estimate(estimateId),
    queryFn: () => estimateService.getById(estimateId),
  });

  const type = estimate ? paymentTypeOfStage(estimate.paymentStage) : null;
  const amount =
    type === "DEPOSIT"
      ? (estimate?.depositAmount ?? null)
      : type === "BALANCE"
        ? (estimate?.balanceAmount ?? null)
        : null;
  // 선수금은 기한이 지나면 BE가 거절합니다. 화면에서도 미리 막아 결제창까지 가지 않게 합니다
  const isExpired =
    type === "DEPOSIT" &&
    estimate?.depositDueAt != null &&
    new Date(estimate.depositDueAt).getTime() < openedAt;
  // 기사님의 추가 금액 요청에 아직 응답하지 않았다면 잔금이 정해지지 않았습니다 — 응답이 먼저입니다
  const isExtraPending =
    type === "BALANCE" && (estimate?.extraCharges ?? []).some((c) => c.status === "PROPOSED");
  const isPayable = type !== null && amount !== null && amount > 0 && !isExpired && !isExtraPending;

  // 위젯은 한 번만 그립니다. StrictMode가 effect를 두 번 돌려도 첫 번째 실행은 cleanup에서
  // cancelled가 되므로, 각 await 뒤에서 확인해 같은 영역에 두 번 그려지지 않게 합니다.
  useEffect(() => {
    if (!isPayable || amount === null || !CLIENT_KEY) return;

    let cancelled = false;

    (async () => {
      try {
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        if (cancelled) return;

        // 비회원 결제 — 저장된 결제 수단 기능이 필요하면 고객별 고유 키로 바꿉니다
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        await widgets.setAmount({ currency: "KRW", value: amount });
        if (cancelled) return;

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: `#${PAYMENT_METHOD_ID}`,
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({ selector: `#${AGREEMENT_ID}`, variantKey: "AGREEMENT" }),
        ]);
        if (cancelled) return;

        widgetsRef.current = widgets;
        setIsReady(true);
      } catch {
        if (!cancelled) setIsWidgetFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      widgetsRef.current = null;
    };
  }, [isPayable, amount]);

  // 토스트는 일정 시간 뒤 스스로 사라집니다
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const handlePay = async () => {
    const widgets = widgetsRef.current;
    if (!widgets || type === null) return;

    setIsPaying(true);
    try {
      // 현재 주소(언어 prefix 포함)를 기준으로 돌아올 주소를 만듭니다 — `/en/customer/payment/12/success`
      const base = `${window.location.origin}${window.location.pathname.replace(/\/$/, "")}`;
      await widgets.requestPayment({
        orderId: toPaymentOrderId(estimateId, type),
        orderName: type === "DEPOSIT" ? t("orderNameDeposit") : t("orderName"),
        successUrl: `${base}/success`,
        failUrl: `${base}/fail`,
      });
    } catch (paymentError) {
      // 결제창을 닫은 건 오류가 아닙니다
      if ((paymentError as { code?: string }).code !== "USER_CANCEL") {
        setToast(t("unavailable"));
      }
    } finally {
      setIsPaying(false);
    }
  };

  if (error) return <PaymentMessage>{t("loadFailed")}</PaymentMessage>;

  if (isPending) {
    return (
      <div className="min-h-dvh bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (estimate.paymentStage === "PAID") {
    return (
      <PaymentMessage>
        <div className="flex flex-col items-center gap-6">
          <p>{t("alreadyPaid")}</p>
          <div className="w-60">
            <Button onClick={() => router.replace("/customer/my-quotes?tab=payHistory")}>
              {t("goHistory")}
            </Button>
          </div>
        </div>
      </PaymentMessage>
    );
  }

  if (isExpired) {
    return (
      <PaymentMessage>
        <div className="flex flex-col items-center gap-6">
          <p>{t("depositExpired")}</p>
          <div className="w-60">
            <Button onClick={() => router.replace("/customer/my-quotes")}>{t("goQuotes")}</Button>
          </div>
        </div>
      </PaymentMessage>
    );
  }

  if (!isPayable || type === null || amount === null) {
    return (
      <PaymentMessage>
        <div className="flex flex-col items-center gap-6">
          <p>{isExtraPending ? t("extraPending") : t("notPayable")}</p>
          <div className="w-60">
            <Button onClick={() => router.replace("/customer/my-quotes?tab=payPending")}>
              {t("goPayPending")}
            </Button>
          </div>
        </div>
      </PaymentMessage>
    );
  }

  const isUnavailable = isWidgetFailed || !CLIENT_KEY;
  const isDeposit = type === "DEPOSIT";
  const approvedExtra = extraChargesByStatus(estimate, "APPROVED");

  return (
    <main className="tablet:px-18 min-h-dvh bg-gray-50 px-6 py-10">
      <div className="mx-auto flex w-full max-w-150 flex-col gap-6">
        <h1 className="text-20 text-black-500 font-bold">
          {isDeposit ? t("titleDeposit") : t("titleBalance")}
        </h1>

        <section className="flex flex-col gap-3 rounded-2xl bg-white p-6">
          <p className="text-16 text-black-500 font-semibold">{estimate.mover.nickName}</p>

          {/* 견적가에서 이번 결제 금액이 어떻게 나오는지 보여줍니다 */}
          <div className="flex items-center justify-between">
            <span className="text-14 text-gray-gray-400 font-medium">{t("quotePrice")}</span>
            <span className="text-14 text-black-500 font-semibold">
              {tCommon("price", { amount: (estimate.price ?? 0).toLocaleString() })}
            </span>
          </div>
          {!isDeposit && estimate.depositAmount !== null && (
            <div className="flex items-center justify-between">
              <span className="text-14 text-gray-gray-400 font-medium">{t("depositPaidRow")}</span>
              <span className="text-14 text-black-500 font-semibold">
                -{tCommon("price", { amount: estimate.depositAmount.toLocaleString() })}
              </span>
            </div>
          )}
          {!isDeposit && approvedExtra.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-14 text-gray-gray-400 font-medium">{t("extraRow")}</span>
              <span className="text-14 text-black-500 font-semibold">
                +{tCommon("price", { amount: sumExtraCharges(approvedExtra).toLocaleString() })}
              </span>
            </div>
          )}
          {!isDeposit &&
            approvedExtra.map((charge) => (
              <p
                key={charge.id}
                className="text-12 text-gray-gray-400 font-medium wrap-break-word whitespace-pre-line"
              >
                {t("extraReasonRow", { reason: charge.reason })}
              </p>
            ))}
          <div className="border-line-100 flex items-center justify-between border-t pt-3">
            <span className="text-14 text-gray-gray-400 font-medium">{t("amountLabel")}</span>
            <span className="text-20 text-black-500 font-bold">
              {tCommon("price", { amount: amount.toLocaleString() })}
            </span>
          </div>

          {isDeposit && estimate.depositDueAt && (
            <p className="text-12 font-medium text-orange-400">
              {t("depositNotice", { date: formatDueDateTime(estimate.depositDueAt, locale) })}
            </p>
          )}
        </section>

        {/* 토스 결제위젯이 이 두 영역에 그려집니다 */}
        <div id={PAYMENT_METHOD_ID} />
        <div id={AGREEMENT_ID} />

        {isUnavailable ? (
          <p className="text-14 text-center text-red-500">{t("unavailable")}</p>
        ) : (
          !isReady && <p className="text-14 text-gray-gray-400 text-center">{t("preparing")}</p>
        )}

        <Button size="md" disabled={!isReady || isPaying} onClick={handlePay}>
          {t("payButton", { amount: amount.toLocaleString() })}
        </Button>
      </div>

      {toast && <Toast message={toast} />}
    </main>
  );
}
