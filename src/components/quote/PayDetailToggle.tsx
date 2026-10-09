"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import ExtraChargeInfo from "@/components/quote/ExtraChargeInfo";
import { cn } from "@/lib/utils/cn";
import { extraChargesByStatus, type Estimate } from "@/lib/services/estimate-service";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-14 text-gray-gray-400 font-medium">{label}</span>
      <span className="text-14 text-black-500 font-semibold">{value}</span>
    </div>
  );
}

/**
 * "견적 상세" 라벨 — 누르면 이 견적의 금액 내역과 추가 금액의 사유가 펼쳐집니다.
 *
 * 결제 목록 카드에는 지금 낼 금액만 있어서, 선수금·잔금이 어떻게 나왔는지와 기사님이 **왜 추가 금액을
 * 요청했는지**를 알려면 상세 페이지까지 들어가야 했습니다. 카드 안에서 바로 확인하도록 접었다 펼치는
 * 라벨로 둡니다. 추가 금액을 요청하지 않은 견적이면 금액 내역만 나옵니다.
 */
export default function PayDetailToggle({ estimate }: { estimate: Estimate }) {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const price = (amount: number) => tCommon("price", { amount: amount.toLocaleString() });
  // 승인한 추가 금액은 잔금에 들어가므로 내역에 건별로 보여주고, 응답 대기·거절은 따로 보여줍니다
  const approved = extraChargesByStatus(estimate, "APPROVED");
  const others = estimate.extraCharges.filter((charge) => charge.status !== "APPROVED");

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-14 text-gray-gray-500 flex items-center gap-1 self-start font-semibold"
      >
        {t("detailToggle")}
        <span aria-hidden className={cn("transition-transform", isOpen && "rotate-180")}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div id={panelId} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-2xl bg-gray-100 p-4">
            <Row label={t("quotePrice")} value={price(estimate.price ?? 0)} />
            {estimate.depositAmount !== null && (
              <Row label={t("breakdownDeposit")} value={price(estimate.depositAmount)} />
            )}
            {/* 승인한 추가 금액은 잔금에 들어갑니다 — "추가 사유" 제목 밑에 건마다 사유가 오고, 금액은 그 줄 맨 오른쪽에 둡니다 */}
            {approved.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-14 text-gray-gray-400 font-medium">
                  {t("extraReasonTitle")}
                </span>
                {approved.map((charge) => (
                  <div key={charge.id} className="flex items-start justify-between gap-4 pl-3">
                    <span className="text-14 text-black-500 min-w-0 flex-1 font-semibold wrap-break-word">
                      {charge.reason}
                    </span>
                    <span className="text-14 text-black-500 shrink-0 font-semibold whitespace-nowrap">
                      +{price(charge.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Row label={t("breakdownBalance")} value={price(estimate.balanceAmount)} />
          </div>

          {/* 승인한 건은 위 내역에 사유까지 있어 중복이라 빼고, 응답 대기·거절은 잔금에 안 들어가니 따로 보여줍니다 */}
          <ExtraChargeInfo estimate={estimate} charges={others} />
        </div>
      )}
    </div>
  );
}
