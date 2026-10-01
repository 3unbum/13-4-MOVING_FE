import type { UserRole } from "@/lib/services/auth-service";
import type { NotificationItem } from "@/lib/services/notification-service";

/**
 * 알림을 누르면 갈 화면.
 *
 * 견적 알림은 상세 id가 있습니다. 이사 전날·당일은 요청 id만 있어서
 * 역할의 견적 목록으로 보냅니다. 받은 요청은 상세 라우트가 없습니다.
 */
export function notificationHref(item: NotificationItem, role: UserRole) {
  if (item.type === "NEW_REQUEST") return "/mover/requests" as const;

  if (
    (item.type === "NEW_ESTIMATE" || item.type === "ESTIMATE_CONFIRMED") &&
    item.estimateId != null
  ) {
    return role === "MOVER"
      ? (`/mover/my-quotes/${item.estimateId}` as const)
      : (`/customer/my-quotes/${item.estimateId}` as const);
  }

  return role === "MOVER" ? ("/mover/my-quotes" as const) : ("/customer/my-quotes" as const);
}
