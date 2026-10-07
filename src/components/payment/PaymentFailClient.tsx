"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import { useRouter } from "@/i18n/navigation";

interface PaymentFailClientProps {
  estimateId: number;
  /** 토스 결제창이 failUrl 쿼리로 돌려준 오류 코드 (예: `PAY_PROCESS_CANCELED`) */
  code?: string;
}

/**
 * 결제창에서 실패하거나 취소하고 돌아오는 화면.
 *
 * 토스가 주는 `message`는 그대로 쓰지 않습니다 — 고정된 한국어일 수 있어 다른 언어 화면에
 * 섞여 나오기 때문입니다. 사용자가 직접 닫은 경우(`PAY_PROCESS_CANCELED`)만 따로 구분합니다.
 */
export default function PaymentFailClient({ estimateId, code }: PaymentFailClientProps) {
  const t = useTranslations("payment");
  const router = useRouter();
  const isCanceled = code === "PAY_PROCESS_CANCELED";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-6">
      <div className="flex w-full max-w-81.75 flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-20 text-black-500 font-bold">{t("failTitle")}</h1>
          <p className="text-14 text-gray-gray-400 font-medium">
            {isCanceled ? t("failCanceled") : t("failBody")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button size="md" onClick={() => router.replace(`/customer/payment/${estimateId}`)}>
            {t("retryPay")}
          </Button>
          <Button
            variant="outlined"
            size="md"
            onClick={() => router.replace("/customer/my-quotes?tab=payPending")}
          >
            {t("goPayPending")}
          </Button>
        </div>
      </div>
    </main>
  );
}
