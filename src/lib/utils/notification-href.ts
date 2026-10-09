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

  // 결제 완료는 기사님만 받습니다 — 방금 결제된 견적이 결제일과 함께 보이는 결제 내역 탭으로 보냅니다
  if (item.type === "PAYMENT_COMPLETED") return "/mover/my-quotes?tab=payHistory" as const;

  // 추가 금액 요청은 고객이 받습니다 — 승인·거절은 결제 대기 목록의 해당 견적 카드에서 합니다
  if (item.type === "EXTRA_CHARGE_PROPOSED") return "/customer/my-quotes?tab=payPending" as const;

  // 추가 금액에 대한 고객의 응답은 기사님이 받습니다 — 승인되면 잔금이 늘어난 채로 결제 대기 목록에 남습니다
  if (item.type === "EXTRA_CHARGE_RESPONDED") return "/mover/my-quotes?tab=payPending" as const;

  // 결제 요청은 고객만 받습니다 — 결제창으로 바로 보내지 않고 대기 중인 결제 탭으로 보냅니다.
  // 금액과 기사님을 카드에서 확인한 뒤 "결제하기"를 직접 누르게 하려는 것입니다.
  if (item.type === "PAYMENT_REQUEST") return "/customer/my-quotes?tab=payPending" as const;

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
