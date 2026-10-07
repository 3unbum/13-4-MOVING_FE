"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { Estimate, EstimateExtraCharge } from "@/lib/services/estimate-service";

interface ExtraChargeInfoProps {
  estimate: Estimate;
  /** 보여줄 건 — 생략하면 이 견적의 추가 금액 전부입니다 (펼침 내역이 승인 건을 따로 그릴 때 나머지만 넘깁니다) */
  charges?: EstimateExtraCharge[];
  className?: string;
}

/**
 * 고객이 보는 추가 금액 안내 — 건마다 얼마가, 왜 추가됐는지와 지금 상태(응답 대기·승인함·거절함)를 보여줍니다.
 *
 * 승인 전에는 승인·거절 버튼이 있는 요청 카드(`PayAction`의 ExtraChargeRequest)가 사유를 보여주지만,
 * 응답한 뒤에는 그 카드가 사라집니다. 그래서 견적 상세·결제 화면·결제 내역에서 사유를 다시 확인할 수
 * 있도록 이 영역을 따로 둡니다. 거절한 요청도 기록으로 남기므로 거절 사유도 그대로 보입니다.
 *
 * 각 건은 **사유 옆 맨 오른쪽에 금액**을 둡니다 — 기사님이 사유를 쓰고 그 옆에 금액을 입력한 것과
 * 같은 모양이라, "왜 이 금액이 추가됐는지"가 한 줄로 읽힙니다.
 *
 * 추가 금액을 요청한 적 없는 견적이면 아무것도 그리지 않으니 호출부가 조건을 걸 필요가 없습니다.
 */
export default function ExtraChargeInfo({ estimate, charges, className }: ExtraChargeInfoProps) {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const list = charges ?? estimate.extraCharges;

  if (list.length === 0) return null;

  const badgeOf = (status: EstimateExtraCharge["status"]) =>
    status === "PROPOSED"
      ? t("extraBadgeProposed")
      : status === "APPROVED"
        ? t("extraBadgeApproved")
        : t("extraBadgeRejected");

  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl bg-gray-100 p-4", className)}>
      <span className="text-14 text-black-500 font-semibold">{t("extraInfoTitle")}</span>

      <ul className="flex flex-col gap-3">
        {list.map((charge) => {
          const isRejected = charge.status === "REJECTED";

          return (
            <li key={charge.id} className="flex flex-col gap-1">
              <span
                className={cn(
                  "text-12 w-fit rounded-full px-2 py-0.5 font-semibold",
                  charge.status === "APPROVED"
                    ? "bg-orange-100 text-orange-400"
                    : "text-gray-gray-500 bg-white"
                )}
              >
                {badgeOf(charge.status)}
              </span>

              {/* "추가 사유 …" 한 줄 — 금액은 그 줄 맨 오른쪽에 붙습니다. 사유가 길면 사유만 줄바꿈됩니다 */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 gap-2">
                  <span className="text-14 text-gray-gray-400 shrink-0 font-medium">
                    {t("extraReasonTitle")}
                  </span>
                  <p className="text-14 text-black-500 font-semibold wrap-break-word whitespace-pre-line">
                    {charge.reason}
                  </p>
                </div>

                {/* 거절한 추가 금액은 잔금에 들어가지 않으므로 흐리게 보여줍니다 */}
                <span
                  className={cn(
                    "text-14 shrink-0 font-bold whitespace-nowrap",
                    isRejected ? "text-gray-gray-400 line-through" : "text-black-500"
                  )}
                >
                  +{tCommon("price", { amount: charge.amount.toLocaleString() })}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
