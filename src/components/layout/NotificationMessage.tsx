"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { UserRole } from "@/lib/services/auth-service";
import type { NotificationItem, NotificationType } from "@/lib/services/notification-service";
import type { RegionCode } from "@/components/filter/ChipRegion";
import type { NotificationTone } from "@/components/layout/DropdownNotification";

interface NotificationCopyProps {
  item: NotificationItem;
  role: UserRole;
}

function Emphasis({ children }: { children: ReactNode }) {
  return <span className="text-red-200">{children}</span>;
}

function RouteTo({ children }: { children: ReactNode }) {
  return <span className="text-[#2f6fed]">{children}</span>;
}

export function notificationTone(type: NotificationType): NotificationTone {
  switch (type) {
    case "NEW_REQUEST":
      return "request";
    case "ESTIMATE_CONFIRMED":
    case "PAYMENT_COMPLETED":
    case "DEPOSIT_PAID":
    case "EXTRA_CHARGE_RESPONDED":
      return "confirmed";
    case "MOVING_DAY":
    case "MOVING_DAY_BEFORE":
      return "moving";
    case "NEW_ESTIMATE":
    case "PAYMENT_REQUEST":
    case "DEPOSIT_EXPIRED":
    case "EXTRA_CHARGE_PROPOSED":
      return "quote";
    case "NEW_CHAT_MESSAGE":
      return "chat";
  }
}

export default function NotificationMessage({ item, role }: NotificationCopyProps) {
  const t = useTranslations("notification");
  const tService = useTranslations("service");
  const tRegion = useTranslations("region");
  const em = (chunks: ReactNode) => <Emphasis>{chunks}</Emphasis>;
  const dest = (chunks: ReactNode) => <RouteTo>{chunks}</RouteTo>;
  const place = (code: RegionCode | undefined, address: string | undefined) =>
    code ? tRegion(code) : (address ?? "");

  switch (item.type) {
    case "NEW_REQUEST":
      return t("newRequest", { name: item.payload.customerName });
    case "NEW_ESTIMATE":
      return t.rich("newEstimate", {
        name: item.payload.moverNickName,
        category: tService(item.payload.category),
        em,
      });
    case "EXTRA_CHARGE_PROPOSED":
      return t.rich("extraChargeProposed", { name: item.payload.moverNickName, em });
    case "EXTRA_CHARGE_RESPONDED":
      return t.rich(item.payload.approved ? "extraChargeApproved" : "extraChargeRejected", {
        name: item.payload.customerName,
        em,
      });
    case "DEPOSIT_PAID":
      return t.rich("depositPaid", { name: item.payload.customerName, em });
    case "DEPOSIT_EXPIRED":
      // 같은 알림을 고객과 기사님이 받습니다 — 받는 사람 기준으로 상대 이름을 보여줍니다
      return role === "MOVER"
        ? t.rich("depositExpiredMover", { name: item.payload.customerName, em })
        : t.rich("depositExpiredCustomer", { name: item.payload.moverNickName, em });
    case "PAYMENT_COMPLETED":
      return t.rich("paymentCompleted", { name: item.payload.customerName, em });
    case "PAYMENT_REQUEST":
      return t.rich("paymentRequest", { name: item.payload.moverNickName, em });
    case "ESTIMATE_CONFIRMED":
      return role === "MOVER"
        ? t.rich("estimateConfirmedMover", { em })
        : t.rich("estimateConfirmedCustomer", { name: item.payload.moverNickName, em });
    case "NEW_CHAT_MESSAGE":
      return t.rich("newChatMessage", { name: item.payload.senderName, em });
    case "MOVING_DAY_BEFORE":
      return t.rich("movingDayBefore", {
        from: place(item.payload.fromRegion, item.payload.fromAddress),
        to: place(item.payload.toRegion, item.payload.toAddress),
        em,
        dest,
      });
    case "MOVING_DAY":
      return t.rich("movingDay", {
        from: place(item.payload.fromRegion, item.payload.fromAddress),
        to: place(item.payload.toRegion, item.payload.toAddress),
        em,
        dest,
      });
  }
}

/** 카드 둘째 줄. 견적 도착·이사일 문장에는 없습니다. */
export function NotificationDescription({ item, role }: NotificationCopyProps) {
  const t = useTranslations("notification");
  const tService = useTranslations("service");
  const tRegion = useTranslations("region");

  if (item.type === "NEW_REQUEST") {
    return t("meta", {
      left: tRegion(item.payload.fromRegion),
      right: tService(item.payload.category),
    });
  }

  if (item.type === "ESTIMATE_CONFIRMED" && role === "MOVER") {
    return t("meta", {
      left: item.payload.customerName,
      right: tService(item.payload.category),
    });
  }

  return null;
}
