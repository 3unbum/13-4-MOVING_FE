"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Gnb from "@/components/layout/Gnb";
import NotificationMessage, {
  NotificationDescription,
  notificationTone,
} from "@/components/layout/NotificationMessage";
import {
  GNB_HOME_PATH,
  GNB_LOGIN_PATH,
  GNB_PROFILE_PATHS,
  isGnbProfilePathAction,
} from "@/constants/gnb/profile";
import { groupRequestSummary, useNotifications } from "@/hooks/useNotifications";
import { openChatRoom } from "@/lib/utils/chat-open";
import { notificationHref } from "@/lib/utils/notification-href";
import { formatElapsedTime, type DateLocale } from "@/lib/utils/date";
import { useAuth } from "@/providers/AuthProvider";

// RootLayout(서버 컴포넌트)은 useAuth를 직접 못 써서, 실제 로그인 상태를 Gnb(순수 프레젠테이션)에
// 주입해주는 클라이언트 경계. Gnb 자체는 컴포넌트 쇼케이스(app/(main)/components/gnb)에서도
// 독립적으로 쓰이므로 계속 props 기반으로 둔다.
export default function GlobalGnb() {
  const router = useRouter();
  const locale = useLocale() as DateLocale;
  const { account, isAuthenticated, logout } = useAuth();
  const isMover = account?.role === "MOVER";
  const {
    items,
    unreadCount,
    summaryItems,
    hasMore,
    isLoadingMore,
    loadMore,
    markRead,
    markAllRead,
    remove,
    removeAll,
  } = useNotifications(isAuthenticated, isMover);

  const role = account?.role ?? "CUSTOMER";

  const notifications = items.map((item) => ({
    id: String(item.id),
    isRead: item.isRead,
    tone: notificationTone(item.type),
    message: <NotificationMessage item={item} role={role} />,
    description:
      item.type === "NEW_REQUEST" || (item.type === "ESTIMATE_CONFIRMED" && role === "MOVER") ? (
        <NotificationDescription item={item} role={role} />
      ) : undefined,
    timeLabel: formatElapsedTime(item.createdAt, locale),
  }));

  const requestSummary = isMover
    ? groupRequestSummary(summaryItems, account.regions, account.services).map((group) => ({
        id: group.region,
        region: group.region,
        parts: group.categories.map((part) => ({
          category: part.category,
          count: part.count,
        })),
      }))
    : undefined;

  const openNotification = (id: string) => {
    const item = items.find((notification) => String(notification.id) === id);
    if (!item || !account) return;

    // 채팅 알림은 페이지 이동이 아니라 채팅 창을 그 방으로 엽니다.
    // 읽음 API를 기다리면 패널만 닫히고 화면은 그대로인 것처럼 보입니다.
    if (item.type === "NEW_CHAT_MESSAGE") {
      openChatRoom({ roomId: item.payload.roomId, name: item.payload.senderName });
    } else {
      router.push(notificationHref(item, account.role));
    }

    if (!item.isRead) {
      markRead.mutate(item.id, {
        onError: (error) => console.error("알림 읽음 처리에 실패했어요", error),
      });
    }
  };

  const handleProfileSelect = async (value: string) => {
    if (isGnbProfilePathAction(value)) {
      router.push(GNB_PROFILE_PATHS[value]);
      return;
    }

    if (value !== "logout") return;

    try {
      await logout();
      router.push(GNB_HOME_PATH);
    } catch (error) {
      // 네트워크 오류·5xx — 로그아웃 실패, 현재 화면 유지 (성공 시에만 이동)
      console.error("로그아웃에 실패했어요", error);
    }
  };

  return (
    <Gnb
      isLoggedIn={isAuthenticated}
      role={isMover ? "mover" : "customer"}
      userName={account?.name}
      profileImage={account?.image}
      notifications={isAuthenticated ? notifications : []}
      unreadCount={isAuthenticated ? unreadCount : 0}
      hasMoreNotifications={hasMore}
      isLoadingMoreNotifications={isLoadingMore}
      onLoadMoreNotifications={loadMore}
      requestSummary={requestSummary}
      summarySeenScope={account?.role === "MOVER" ? String(account.userId) : null}
      onLoginClick={() => router.push(GNB_LOGIN_PATH)}
      onNotificationSelect={openNotification}
      onMarkNotificationRead={(id) => {
        markRead.mutate(Number(id), {
          onError: (error) => console.error("알림 읽음 처리에 실패했어요", error),
        });
      }}
      onReadAllNotifications={() => {
        markAllRead.mutate(undefined, {
          onError: (error) => console.error("알림 전체 읽음에 실패했어요", error),
        });
      }}
      onDeleteNotification={(id) => {
        remove.mutate(Number(id), {
          onError: (error) => console.error("알림 삭제에 실패했어요", error),
        });
      }}
      onDeleteAllNotifications={() => {
        removeAll.mutate(undefined, {
          onError: (error) => console.error("알림 전체 삭제에 실패했어요", error),
        });
      }}
      onRequestSummarySelect={() => router.push("/mover/requests")}
      onProfileSelect={handleProfileSelect}
    />
  );
}
