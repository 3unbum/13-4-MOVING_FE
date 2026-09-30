"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { profileService } from "@/lib/services/profile-service";
import type { MoverAccountResponse } from "@/lib/services/auth-service";

// 마이페이지 수정 화면(프로필 수정/기본정보 수정, #73) 공용 — 두 화면이 원래 탭 하나로 묶여있을 때
// MoverMyPageTabs에 있던 계정 로딩 로직을 분리했다(2026-09-17, 피그마가 탭이 아니라 완전히 분리된
// 두 화면 + 마이페이지의 별도 버튼 두 개로 설계돼 있는 게 확인돼 탭 구조를 걷어내면서 공용 훅으로 뺌).
// initialAccount는 서버 컴포넌트(page.tsx)의 requireRole 결과 — null은 accessToken 만료 직후
// fail-open 구간(guards.ts 주석 참고)뿐이라, 그때만 여기서 클라이언트가 직접 한 번 더 조회한다.
export function useMoverAccount(initialAccount: MoverAccountResponse | null) {
  const router = useRouter();
  const [account, setAccount] = useState<MoverAccountResponse | null>(initialAccount);
  const [isLoading, setIsLoading] = useState(!initialAccount);
  // 메시지가 아니라 실패 여부만 들고 있습니다 — 문구는 소비처가 렌더 시점에 번역해야
  // 언어를 바꿨을 때 같이 바뀝니다 (훅에서 t를 쓰면 조회 effect가 t에 의존하게 됩니다)
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (account) return;
    let active = true;
    profileService
      .getMover()
      .then((data) => {
        if (!active) return;
        // 서버 가드((with-profile)/layout.tsx)는 requireRole이 fail-open으로 null을 반환하면
        // 건너뛴다 — 그 구간을 여기서 다시 한 번 막는다.
        if (!data.hasProfile) {
          router.replace("/mover/profile-register");
          return;
        }
        setAccount(data);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [account, router]);

  return { account, isLoading, hasError, setAccount };
}
