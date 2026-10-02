"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import ProfileRegisterModal from "@/components/auth/ProfileRegisterModal";
import type { OAuthProviderKey } from "@/constants/auth/oauth";
import { authService, type UserRole } from "@/lib/services/auth-service";
import { consumeOAuthState, getOAuthRedirectUri, isOAuthProviderKey } from "@/lib/utils/oauth";
import { toAuthErrorMessage } from "@/lib/auth/auth-error-message";
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
  | { ok: false; reasonKey: "oauthCancelled" | "invalidAccess" };

/**
 * 형식 검사만 — state 대조는 sessionStorage가 필요해 SSR에서 못 읽으므로 effect에서 한다.
 *
 * 컴포넌트 밖이라 `useTranslations`를 못 쓴다. 문구 대신 **번역 키**를 돌려주고
 * 호출부가 렌더 시점에 번역한다 — 언어를 바꿔도 문구가 따라온다.
 */
function checkAccess({
  provider,
  code,
  state,
  providerError,
}: OAuthCallbackClientProps): AccessCheck {
  if (providerError) return { ok: false, reasonKey: "oauthCancelled" };
  if (!isOAuthProviderKey(provider) || !code || !state) {
    return { ok: false, reasonKey: "invalidAccess" };
  }
  return { ok: true, provider, code, state };
}

export default function OAuthCallbackClient(props: OAuthCallbackClientProps) {
  const t = useTranslations("auth");
  const tAuthError = useTranslations("authError");
  const access = checkAccess(props);
  const router = useRouter();
  const { refetch } = useAuth();
  // 렌더링 시점에 판정 가능한 값이라 effect의 setState 대신 lazy initial state로 반영한다.
  const [status, setStatus] = useState<Status>(access.ok ? "exchanging" : "error");
  // errorKey는 접근 차단 등 화면 자체의 사유(번역 키), errorText는 API 에러를 현재 언어로
  // 바꾼 완성된 문구입니다. 렌더에서 errorText를 먼저 씁니다.
  const [errorKey, setErrorKey] = useState<string | null>(access.ok ? null : access.reasonKey);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [resolvedRole, setResolvedRole] = useState<UserRole | null>(null);

  // code는 1회용이라 Strict Mode가 effect를 두 번 실행해도 요청은 한 번만 나가야 한다.
  // cleanup으로 결과를 버리면 유일하게 나간 요청의 응답까지 버려져 화면이 멈추므로 쓰면 안 된다.
  const hasRequestedRef = useRef(false);

  // 이메일 로그인과 동일하게 customer만 프로필 등록을 모달로 묻는다.
  const finishAuth = async (role: UserRole, hasProfile: boolean) => {
    try {
      await refetch();
    } catch {
      // 가입·로그인은 이미 성공했고 계정 조회만 실패한 상태 — 안 잡으면 화면이 "처리 중"에 멈춘다.
      setErrorKey("accountLoadFailed");
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
      // 이 브라우저가 시작한 요청인지 확인 — 공격자가 만든 링크는 짝이 되는 nonce가 없어 여기서 막힌다.
      const role = consumeOAuthState(state);
      if (!role) {
        setErrorKey("invalidAccessRetry");
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
        setErrorText(toAuthErrorMessage(error, tAuthError, t("oauthFailed")));
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
        <p>{errorText ?? (errorKey ? t(errorKey) : null)}</p>
        <button type="button" className="underline" onClick={() => router.replace("/")}>
          {t("backToHome")}
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="p-10 text-center">{t("processingLogin")}</p>
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
