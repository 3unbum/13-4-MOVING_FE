"use client";

import Gnb, { type GnbNotification } from "@/components/layout/Gnb";
import NotificationMessage, {
  NotificationDescription,
  notificationTone,
} from "@/components/layout/NotificationMessage";
import { cn } from "@/lib/utils/cn";
import { formatElapsedTime, type DateLocale } from "@/lib/utils/date";
import type { UserRole } from "@/lib/services/auth-service";
import type { NotificationItem } from "@/lib/services/notification-service";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

type PreviewState = "logout" | "customer" | "mover" | "empty" | "moverEmpty";

/** 상대 시각이 서버·클라이언트에서 달라지지 않도록 기준 시각을 고정합니다. */
const PREVIEW_NOW = Date.UTC(2026, 9, 1, 6, 0, 0);
const HOUR = 60 * 60 * 1000;

function ago(hours: number) {
  return new Date(PREVIEW_NOW - hours * HOUR).toISOString();
}

const CUSTOMER_ITEMS: NotificationItem[] = [
  {
    id: 1,
    isRead: false,
    createdAt: ago(2),
    estimateId: 11,
    quotationRequestId: null,
    type: "NEW_ESTIMATE",
    payload: { moverNickName: "김코드", category: "SMALL", price: null },
  },
  {
    id: 2,
    isRead: false,
    createdAt: ago(3),
    estimateId: 12,
    quotationRequestId: null,
    type: "ESTIMATE_CONFIRMED",
    payload: { moverNickName: "김코드", customerName: "김가나", category: "SMALL" },
  },
  {
    id: 3,
    isRead: true,
    createdAt: ago(5),
    estimateId: null,
    quotationRequestId: 3,
    type: "MOVING_DAY_BEFORE",
    payload: { fromRegion: "GYEONGGI", toRegion: "SEOUL", movingDate: "2026-10-02" },
  },
  {
    id: 4,
    isRead: true,
    createdAt: ago(8),
    estimateId: null,
    quotationRequestId: 4,
    type: "MOVING_DAY",
    payload: { fromRegion: "SEOUL", toRegion: "GYEONGGI", movingDate: "2026-10-01" },
  },
];

const MOVER_ITEMS: NotificationItem[] = [
  {
    id: 1,
    isRead: false,
    createdAt: ago(1),
    estimateId: null,
    quotationRequestId: 21,
    type: "NEW_REQUEST",
    payload: { category: "SMALL", fromRegion: "GYEONGGI", movingDate: "2026-10-04" },
  },
  {
    id: 2,
    isRead: false,
    createdAt: ago(4),
    estimateId: 22,
    quotationRequestId: null,
    type: "ESTIMATE_CONFIRMED",
    payload: { moverNickName: "김코드", customerName: "김가나", category: "SMALL" },
  },
];

function toGnbNotification(
  item: NotificationItem,
  role: UserRole,
  locale: DateLocale
): GnbNotification {
  const showDescription =
    item.type === "NEW_REQUEST" || (item.type === "ESTIMATE_CONFIRMED" && role === "MOVER");

  return {
    id: String(item.id),
    isRead: item.isRead,
    tone: notificationTone(item.type),
    message: <NotificationMessage item={item} role={role} />,
    description: showDescription ? <NotificationDescription item={item} role={role} /> : undefined,
    timeLabel: formatElapsedTime(item.createdAt, locale, PREVIEW_NOW),
  };
}

/** GNB 퍼블리싱 확인용 임시 페이지 — 머지 전 제거 가능 */
export default function ComponentGnbPreviewPage() {
  const [state, setState] = useState<PreviewState>("customer");
  const locale = useLocale() as DateLocale;
  const t = useTranslations("gnbPreview");
  const isMover = state === "mover" || state === "moverEmpty";
  const isEmpty = state === "empty" || state === "moverEmpty";
  const role: UserRole = isMover ? "MOVER" : "CUSTOMER";
  const notifications = isEmpty
    ? []
    : (isMover ? MOVER_ITEMS : CUSTOMER_ITEMS).map((item) => toGnbNotification(item, role, locale));

  const requestSummary = isMover
    ? [
        {
          id: "GYEONGGI",
          region: "GYEONGGI" as const,
          parts: [
            { category: "SMALL" as const, count: 3 },
            { category: "HOME" as const, count: 1 },
            { category: "OFFICE" as const, count: 2 },
          ],
        },
        {
          id: "SEOUL",
          region: "SEOUL" as const,
          parts: [{ category: "HOME" as const, count: 1 }],
        },
      ]
    : undefined;

  const tabs = [
    ["logout", t("loggedOut")],
    ["customer", t("customer")],
    ["mover", t("mover")],
    ["empty", t("empty")],
    ["moverEmpty", t("moverEmpty")],
  ] as const;

  return (
    <div className="bg-background-200 min-h-screen">
      <div className="border-line-100 flex flex-wrap gap-2 border-b bg-gray-50 px-4 py-3">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setState(value)}
            className={cn(
              "text-14 rounded-lg px-3 py-1.5",
              state === value
                ? "bg-orange-400 font-semibold text-white"
                : "text-black-500 bg-background-300 font-medium"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Gnb
        isLoggedIn={state !== "logout"}
        role={isMover ? "mover" : "customer"}
        userName={isMover ? "김코드" : "김가나"}
        notifications={notifications}
        unreadCount={isEmpty ? 0 : 2}
        requestSummary={requestSummary}
        onLoginClick={() => alert("로그인 클릭")}
        onNotificationSelect={(id) => alert(`알림 ${id} 클릭`)}
        onMarkNotificationRead={(id) => alert(`읽음 ${id}`)}
        onDeleteNotification={(id) => alert(`삭제 ${id}`)}
        onReadAllNotifications={() => alert("전체 읽음")}
        onDeleteAllNotifications={() => alert("전체 삭제")}
        onRequestSummarySelect={(id) => alert(`오늘 새 요청 ${id}`)}
        onProfileSelect={(value) => alert(`프로필 메뉴: ${value}`)}
      />

      <p className="text-14 text-gray-gray-500 px-6 py-8">{t("hint")}</p>
    </div>
  );
}
