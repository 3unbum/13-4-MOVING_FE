import "server-only";

/**
 * 메타데이터의 기준 주소 (`metadataBase`).
 *
 * 없으면 상대 경로 og:image 가 절대 URL 로 바뀌지 않아 카카오·페이스북이 못 읽습니다.
 *
 * Vercel 프리뷰 배포는 주소가 매번 달라서, Vercel 이 서버에 넣어주는 `VERCEL_URL` 을
 * 씁니다 — 그래야 프리뷰에서도 og 이미지가 **자기 배포**를 가리켜 테스트할 수 있습니다.
 *
 * ⚠️ 파일을 나눈 이유: `OG_FALLBACK_IMAGE` 는 클라이언트 컴포넌트도 쓰는데, 한 파일에
 * 두면 이 상수까지 클라이언트 번들에 끌려 들어갑니다. `server-only` 로 경계를 못박습니다.
 */
export const SITE_URL = new URL(
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.letsmoving.site"
);
