"use client";

import Gnb, { type GnbNotification } from "@/components/layout/Gnb";
import clsx from "clsx";
import { useState } from "react";

type PreviewState = "logout" | "customer" | "mover";

const NOTIFICATIONS: GnbNotification[] = [
  {
    id: "1",
    message: (
      <>
        김코드 기사님의 <span className="text-orange-400">소형이사 견적</span>이 도착했어요
      </>
    ),
    timeLabel: "2시간 전",
  },
  {
    id: "2",
    message: (
      <>
        김코드 기사님의 견적이 <span className="text-orange-400">확정</span>되었어요
      </>
    ),
    timeLabel: "3시간 전",
  },
  {
    id: "3",
    message: (
      <>
        내일은 <span className="text-orange-400">이사 예정일</span>이에요
      </>
    ),
    timeLabel: "5시간 전",
  },
];

/** GNB 퍼블리싱 확인용 임시 페이지 — 머지 전 제거 가능 */
export default function ComponentGnbPreviewPage() {
  const [state, setState] = useState<PreviewState>("customer");

  return (
    <div className="bg-background-200 min-h-screen">
      <div className="border-line-100 flex flex-wrap gap-2 border-b bg-gray-50 px-4 py-3">
        {(
          [
            ["logout", "비로그인"],
            ["customer", "일반 유저"],
            ["mover", "기사님"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setState(value)}
            className={clsx(
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
        role={state === "mover" ? "mover" : "customer"}
        userName={state === "mover" ? "김코드" : "김가나"}
        notifications={NOTIFICATIONS}
        onLoginClick={() => alert("로그인 클릭")}
        onNotificationSelect={(id) => alert(`알림 ${id} 클릭`)}
        onProfileSelect={(value) => alert(`프로필 메뉴: ${value}`)}
      />

      <p className="text-14 text-gray-gray-500 px-6 py-8">
        알림·프로필 아이콘을 눌러 드롭다운을 확인하세요. 뷰포트 너비를 바꾸면 sm(햄버거) / md /
        pc(가로 메뉴) 상태를 볼 수 있습니다.
      </p>
    </div>
  );
}
