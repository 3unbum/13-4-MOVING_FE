"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProfileRegisterModal from "@/components/auth/ProfileRegisterModal";
import type { OAuthProviderKey } from "@/constants/auth/oauth";
import { authService, type UserRole } from "@/lib/services/auth-service";
import { consumeOAuthState, getOAuthRedirectUri, isOAuthProviderKey } from "@/lib/utils/oauth";
import { ApiError } from "@/lib/utils/api-error";
import { useAuth } from "@/providers/AuthProvider";
import OAuthPhoneModal from "./OAuthPhoneModal";

interface OAuthCallbackClientProps {
  provider: string;
  code?: string;
  state?: string;
  providerError?: string;
}

type Status = "exchanging" | "needsPhone" | "askProfile" | "error";

type AccessCheck =
  | { ok: true; provider: OAuthProviderKey; code: string; state: string }
  | { ok: false; reason: string };

/**
 * 렌더링 시점에 판정 가능한 형식 검사만 한다 — "우리가 시작한 요청인지"(state 대조)는
 * sessionStorage가 필요해 SSR에서 못 읽으므로 effect에서 이어서 확인한다.
 */
function checkAccess({
  provider,
  code,
  state,
  providerError,
}: OAuthCallbackClientProps): AccessCheck {
  if (providerError) return { ok: false, reason: "소셜 로그인이 취소되었습니다." };
  if (!isOAuthProviderKey(provider) || !code || !state) {
    return { ok: false, reason: "잘못된 접근입니다." };
  }
  return { ok: true, provider, code, state };
}

export default function OAuthCallbackClient(props: OAuthCallbackClientProps) {
  const access = checkAccess(props);
  const router = useRouter();
  const { refetch } = useAuth();
  // 렌더링 시점에 이미 판정 가능한 값이라 useEffect의 setState가 아닌 lazy initial state로 반영한다.
  const [status, setStatus] = useState<Status>(access.ok ? "exchanging" : "error");
  const [errorMessage, setErrorMessage] = useState(access.ok ? "" : access.reason);
  // state 대조로 복원한 role — URL이 아니라 우리가 저장해둔 값이라 따로 검증할 필요가 없다.
  const [resolvedRole, setResolvedRole] = useState<UserRole | null>(null);

  // code는 1회용이라 Strict Mode가 effect를 두 번 실행해도 요청은 한 번만 보내야 한다.
  // cleanup으로 결과를 버리는 방식은 쓰면 안 됨 — 실제로 나간 유일한 요청의 응답까지 버려져 화면이 멈춘다.
  const hasRequestedRef = useRef(false);

  // 로그인·가입이 끝난 뒤 공통 처리 — 이메일 로그인과 동일하게 customer만 프로필 등록을 모달로 묻는다.
  const finishAuth = async (role: UserRole, hasProfile: boolean) => {
    try {
      await refetch();
    } catch {
      // 로그인·가입 자체는 성공(쿠키 발급 완료)이고 계정 조회만 실패한 상태 — 모달의 onCompleted에서
      // 호출될 땐 이 함수를 await하는 쪽이 없어, 여기서 안 잡으면 화면이 "처리 중"에 그대로 멈춘다.
      setErrorMessage("계정 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setStatus("error");
      return;
    }

    if (role === "MOVER") {
      router.replace(hasProfile ? "/mover/requests" : "/mover/profile-register");
      return;
    }
    if (hasProfile) {
      router.replace("/");
      return;
    }
    setStatus("askProfile");
  };

  useEffect(() => {
    if (!access.ok || hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    const { provider, code, state } = access;

    // 이미 쓴 code가 URL에 남아 있으면 새로고침 때 재교환을 시도해 INVALID_OAUTH_CODE로 깨진다.
    window.history.replaceState(null, "", window.location.pathname);

    (async () => {
      // 이 브라우저가 시작한 인가 요청인지 확인 — 공격자가 만든 콜백 링크에는 짝이 되는 nonce가
      // 저장돼 있지 않아 여기서 막힌다(로그인 CSRF 방지). role도 URL 대신 이 저장값에서 복원한다.
      const role = consumeOAuthState(state);
      if (!role) {
        setErrorMessage("잘못된 접근입니다. 로그인을 다시 시도해 주세요.");
        setStatus("error");
        return;
      }
      setResolvedRole(role);

      try {
        const result = await authService.oauthLogin(provider, {
          code,
          redirectUri: getOAuthRedirectUri(provider),
          role,
        });

        if (result.isNewUser) {
          setStatus("needsPhone");
          return;
        }
        await finishAuth(role, result.hasProfile);
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError ? error.message : "소셜 로그인 중 문제가 발생했습니다."
        );
        setStatus("error");
      }
    })();
    // 콜백 진입 시 최초 props로 한 번만 실행해야 해서 의존성을 의도적으로 비워둔다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 아직 계정이 없는 단계라 "다음에"가 없다 — 닫으면 가입을 포기하고 원래 로그인 페이지로 돌려보낸다.
  const handleCancelSignup = () => {
    router.replace(resolvedRole === "MOVER" ? "/mover/login" : "/customer/login");
  };

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 p-10 text-center">
        <p>{errorMessage}</p>
        <button type="button" className="underline" onClick={() => router.replace("/")}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="p-10 text-center">로그인 처리 중입니다...</p>
      {resolvedRole && (
        <OAuthPhoneModal
          open={status === "needsPhone"}
          role={resolvedRole}
          onCancel={handleCancelSignup}
          // 가입 직후엔 항상 프로필이 없는 상태
          onCompleted={() => finishAuth(resolvedRole, false)}
        />
      )}
      <ProfileRegisterModal
        open={status === "askProfile"}
        onSkip={() => router.replace("/")}
        onRegister={() => router.replace("/customer/profile-register")}
      />
    </>
  );
}
