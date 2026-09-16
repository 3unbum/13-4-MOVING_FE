"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProfileRegisterModal from "@/components/auth/ProfileRegisterModal";
import type { OAuthProviderKey } from "@/constants/auth/oauth";
import { authService, type UserRole } from "@/lib/services/auth-service";
import { getOAuthRedirectUri, isOAuthProviderKey } from "@/lib/utils/oauth";
import { ApiError } from "@/lib/utils/api-error";
import { useAuth } from "@/providers/AuthProvider";
import OAuthPhoneModal from "./OAuthPhoneModal";

interface OAuthCallbackClientProps {
  provider: string;
  code?: string;
  role?: string;
  providerError?: string;
}

type Status = "exchanging" | "needsPhone" | "askProfile" | "error";

type AccessCheck =
  | { ok: true; provider: OAuthProviderKey; code: string; role: UserRole }
  | { ok: false; reason: string };

function isUserRole(value: string | undefined): value is UserRole {
  return value === "CUSTOMER" || value === "MOVER";
}

/** 렌더링 시점에 딱 한 번만 판정해서, 이후엔 그 결과(+좁혀진 타입)를 그대로 재사용한다. */
function checkAccess({
  provider,
  code,
  role,
  providerError,
}: OAuthCallbackClientProps): AccessCheck {
  if (providerError) return { ok: false, reason: "소셜 로그인이 취소되었습니다." };
  if (!isOAuthProviderKey(provider) || !code || !isUserRole(role)) {
    return { ok: false, reason: "잘못된 접근입니다." };
  }
  return { ok: true, provider, code, role };
}

export default function OAuthCallbackClient(props: OAuthCallbackClientProps) {
  const access = checkAccess(props);
  const router = useRouter();
  const { refetch } = useAuth();
  // 렌더링 시점에 이미 판정 가능한 값이라 useEffect의 setState가 아닌 lazy initial state로 반영한다.
  const [status, setStatus] = useState<Status>(access.ok ? "exchanging" : "error");
  const [errorMessage, setErrorMessage] = useState(access.ok ? "" : access.reason);

  // code는 1회용이라 Strict Mode가 effect를 두 번 실행해도 요청은 한 번만 보내야 한다.
  // cleanup으로 결과를 버리는 방식은 쓰면 안 됨 — 실제로 나간 유일한 요청의 응답까지 버려져 화면이 멈춘다.
  const hasRequestedRef = useRef(false);

  // 로그인·가입이 끝난 뒤 공통 처리 — 이메일 로그인과 동일하게 customer만 프로필 등록을 모달로 묻는다.
  const finishAuth = async (role: UserRole, hasProfile: boolean) => {
    await refetch();
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
    const { provider, code, role } = access;

    // 이미 쓴 code가 URL에 남아 있으면 새로고침 때 재교환을 시도해 INVALID_OAUTH_CODE로 깨진다.
    window.history.replaceState(null, "", window.location.pathname);

    (async () => {
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
    router.replace(access.ok && access.role === "MOVER" ? "/mover/login" : "/customer/login");
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
      {access.ok && (
        <OAuthPhoneModal
          open={status === "needsPhone"}
          role={access.role}
          onCancel={handleCancelSignup}
          // 가입 직후엔 항상 프로필이 없는 상태
          onCompleted={() => finishAuth(access.role, false)}
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
