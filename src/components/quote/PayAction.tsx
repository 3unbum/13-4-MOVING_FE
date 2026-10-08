"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/common/Button";
import CheckboxButton from "@/components/common/CheckboxButton";
import Toast from "@/components/common/Toast";
import { useRouter } from "@/i18n/navigation";
import { useRespondExtraCharge } from "@/hooks/usePayment";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
import { cn } from "@/lib/utils/cn";
import { formatDueDateTime, type DateLocale } from "@/lib/utils/date";
import {
  extraChargesByStatus,
  paymentTypeOfStage,
  sumExtraCharges,
  type Estimate,
} from "@/lib/services/estimate-service";

interface PayActionProps {
  estimate: Estimate;
  className?: string;
}

/** 토스트 노출 시간 — QuoteDetailClient와 같은 값입니다 */
const TOAST_DURATION_MS = 3000;

/**
 * 기사님의 추가 금액 요청 — 건마다 사유와 금액을 보여주고, 체크한 건을 한 번에 승인·거절합니다.
 *
 * 응답하지 않은 건이 하나라도 남아 있으면 잔금을 결제할 수 없어서(BE `EXTRA_CHARGE_PENDING`) 이 영역이
 * 결제 버튼을 대신합니다. 승인한 건은 잔금에 합산되고 거절한 건은 빠집니다. 응답은 되돌릴 수 없으니 신중히 고르게 합니다.
 * 체크는 처음에 모두 해제돼 있어, 실수로 전부 승인하는 일이 없습니다.
 */
function ExtraChargeRequest({ estimate }: { estimate: Estimate }) {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const tAuthError = useTranslations("authError");
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const respond = useRespondExtraCharge((error) =>
    setToast(toAuthErrorMessage(error, tAuthError, t("extraRespondFailed")))
  );

  const pending = extraChargesByStatus(estimate, "PROPOSED");
  // 응답이 끝나 목록에서 사라진 건의 체크는 무시합니다
  const selected = pending.filter((charge) => checkedIds.includes(charge.id));
  const isAllSelected = pending.length > 0 && selected.length === pending.length;

  const toggle = (id: number) =>
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = (decision: "APPROVE" | "REJECT") =>
    respond.mutate(
      { estimateId: estimate.id, decision, chargeIds: selected.map((charge) => charge.id) },
      { onSuccess: () => setCheckedIds([]) }
    );

  // 토스트는 일정 시간 뒤 스스로 사라집니다
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-orange-100 p-4">
      <div className="flex items-center justify-between">
        <span className="text-14 font-semibold text-orange-400">{t("extraRequestTitle")}</span>
        <span className="text-16 text-black-500 font-bold">
          +{tCommon("price", { amount: sumExtraCharges(pending).toLocaleString() })}
        </span>
      </div>

      {/* 전체 선택 — 건이 둘 이상일 때만 의미가 있습니다 */}
      {pending.length > 1 && (
        <label className="flex cursor-pointer items-center gap-2 self-start">
          <CheckboxButton
            checked={isAllSelected}
            onChange={() => setCheckedIds(isAllSelected ? [] : pending.map((charge) => charge.id))}
            aria-label={t("extraSelectAll")}
          />
          <span className="text-14 text-gray-gray-500 font-medium">{t("extraSelectAll")}</span>
        </label>
      )}

      <ul className="flex flex-col gap-3">
        {pending.map((charge) => (
          <li key={charge.id}>
            <label className="flex cursor-pointer items-start gap-2">
              <CheckboxButton
                checked={checkedIds.includes(charge.id)}
                onChange={() => toggle(charge.id)}
                aria-label={charge.reason}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-12 text-gray-gray-400 font-medium">
                  {t("extraReasonLabel")}
                </span>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-14 text-gray-gray-500 min-w-0 flex-1 wrap-break-word whitespace-pre-line">
                    {charge.reason}
                  </p>
                  <span className="text-14 text-black-500 shrink-0 font-bold whitespace-nowrap">
                    +{tCommon("price", { amount: charge.amount.toLocaleString() })}
                  </span>
                </div>
              </div>
            </label>
          </li>
        ))}
      </ul>

      {selected.length === 0 && (
        <p className="text-12 text-gray-gray-400 font-medium">{t("extraSelectHint")}</p>
      )}

      <div className="flex gap-3">
        <Button
          variant="outlined"
          size="sm"
          disabled={selected.length === 0 || respond.isPending}
          onClick={() => submit("REJECT")}
        >
          {t("extraRejectSelected")}
        </Button>
        <Button
          variant="solid"
          size="sm"
          disabled={selected.length === 0 || respond.isPending}
          onClick={() => submit("APPROVE")}
        >
          {t("extraApproveSelected")}
        </Button>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

/**
 * 결제 버튼 영역 — 지금 낼 결제(선수금/잔금)와 금액, 선수금이면 결제 기한을 보여주고 결제 화면으로 보냅니다.
 *
 * 결제 탭 카드와 견적 상세가 함께 씁니다. 결제할 단계가 아니면(확정 전·이미 결제함 등) 아무것도 그리지 않으니
 * 호출부가 따로 조건을 걸 필요가 없습니다.
 *
 * 선수금은 확정 후 48시간 안에 내야 하고 못 내면 확정이 취소됩니다. 그래서 기한을 눈에 띄게 둡니다.
 * 잔금 단계에서 기사님이 추가 금액을 요청했다면 응답이 먼저입니다 — 응답 전에는 결제 버튼 대신 요청을 보여줍니다.
 */
export default function PayAction({ estimate, className }: PayActionProps) {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const locale = useLocale() as DateLocale;
  const router = useRouter();
  const type = paymentTypeOfStage(estimate.paymentStage);

  if (type === null) return null;

  const isDeposit = type === "DEPOSIT";

  if (!isDeposit && extraChargesByStatus(estimate, "PROPOSED").length > 0) {
    return (
      <div className={className}>
        <ExtraChargeRequest estimate={estimate} />
      </div>
    );
  }

  const amount = isDeposit ? (estimate.depositAmount ?? 0) : estimate.balanceAmount;
  const approvedExtra = sumExtraCharges(extraChargesByStatus(estimate, "APPROVED"));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-14 font-semibold text-orange-400">
          {isDeposit ? t("depositDue") : t("balanceDue")}
        </span>
        <span className="text-16 text-black-500 font-bold">
          {tCommon("price", { amount: amount.toLocaleString() })}
        </span>
      </div>

      {isDeposit && estimate.depositDueAt && (
        <p className="text-12 text-gray-gray-400 font-medium">
          {t("depositDueAt", { date: formatDueDateTime(estimate.depositDueAt, locale) })}
        </p>
      )}

      {/* 승인한 추가 금액은 이미 위 잔금에 들어 있습니다 — 어디서 늘었는지 알려줍니다 */}
      {!isDeposit && approvedExtra > 0 && (
        <p className="text-12 text-gray-gray-400 font-medium">
          {t("extraIncluded", { amount: approvedExtra.toLocaleString() })}
        </p>
      )}

      <Button
        variant="solid"
        size="sm"
        onClick={() => router.push(`/customer/payment/${estimate.id}`)}
      >
        {isDeposit ? t("payDeposit") : t("payBalance")}
      </Button>
    </div>
  );
}
