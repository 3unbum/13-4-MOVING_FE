"use client";

import { Turnstile, type AppearanceMode } from "@marsidev/react-turnstile";

// 비어 있으면 봇 검증을 켜지 않는다 — 로컬·프리뷰에서 키 없이도 로그인이 되게 한다.
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface TurnstileFieldProps {
  /** 통과하면 토큰, 만료·실패하면 null */
  onToken: (token: string | null) => void;
  /** 올리면 위젯을 새로 만들어 토큰을 다시 받는다. 토큰은 1회용이라 제출이 끝날 때마다 올린다 */
  resetKey: number;
  /**
   * 기본 "always"(항상 보임). "interaction-only"면 평소엔 숨어서 자동 통과하고, Cloudflare가 사람 확인이
   * 필요하다고 판단할 때만 이 자리에 체크박스가 나타난다 — 폼 중간에 놓여 항상 보이면 어색한 곳에서 쓴다
   */
  appearance?: AppearanceMode;
}

// 로그인·회원가입 인증번호 발송의 봇 검증 위젯. ref.reset() 대신 key로 다시 마운트한다 — 제출 핸들러에서 ref를 읽으면
// react-hooks/refs 규칙에 걸린다.
export default function TurnstileField({
  onToken,
  resetKey,
  appearance = "always",
}: TurnstileFieldProps) {
  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <Turnstile
      key={resetKey}
      siteKey={TURNSTILE_SITE_KEY}
      onSuccess={onToken}
      onExpire={() => onToken(null)}
      onError={() => onToken(null)}
      options={{ size: "flexible", theme: "light", appearance }}
    />
  );
}
