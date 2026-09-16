"use client";

import Image from "next/image";
import AuxText from "@/components/auth/AuxText";
import type { OAuthProviderKey } from "@/constants/auth/oauth";
import { SOCIAL_PROVIDERS } from "@/constants/auth/social-provider";
import type { UserRole } from "@/lib/services/auth-service";
import { buildOAuthAuthorizeUrl, createOAuthState } from "@/lib/utils/oauth";

interface SocialLoginSectionProps {
  // "로그인" | "회원가입" — 버튼 라벨(예: "구글로 로그인") 접미사로 조합
  actionLabel: string;
  // 콜백 왕복 뒤엔 role을 알 방법이 없어, 지금 서 있는 페이지가 아는 role을 state와 함께 저장해둔다
  role: UserRole;
}

export default function SocialLoginSection({ actionLabel, role }: SocialLoginSectionProps) {
  // nonce는 클릭 시점에 만든다 — 렌더 중에 만들면 서버와 클라이언트 값이 달라져 hydration이 깨진다.
  const startOAuth = (provider: OAuthProviderKey) => {
    const state = createOAuthState(role);
    window.location.assign(buildOAuthAuthorizeUrl(provider, state));
  };

  return (
    <div className="tablet:gap-8 flex w-full flex-col items-center gap-6">
      <AuxText>
        <span className="font-normal">SNS 계정으로 간편 가입하기</span>
      </AuxText>
      <div className="tablet:gap-8 flex items-start gap-6">
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() => startOAuth(provider.key)}
            aria-label={`${provider.name}로 ${actionLabel}`}
            className="shrink-0"
          >
            {/* 모바일(54px)·태블릿·PC(72px) 각각 전용 에셋으로 교체(스케일링 아님) */}
            <Image src={provider.sm} alt="" className="tablet:hidden size-13.5" />
            <Image src={provider.md} alt="" className="tablet:block hidden size-18" />
          </button>
        ))}
      </div>
    </div>
  );
}
