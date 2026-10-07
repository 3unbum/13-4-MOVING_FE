/**
 * 기사님 프로필 사진이 없을 때 쓰는 공유 이미지 (1200×630).
 *
 * 프로필이 없으면 `og:image` 자체가 빠져 밋밋한 카드로 나갔습니다.
 * `public/` 에 둔 이유 — `src/assets` 는 번들 해시 경로라 고정 URL 이 안 나옵니다.
 *
 * 상대 경로인 이유: 서버는 `metadataBase` 가, 클라이언트(`useShare`)는
 * `window.location.origin` 이 절대 URL 로 바꿔 줍니다. 어느 환경에서든 자기 주소를 씁니다.
 */
export const OG_FALLBACK_IMAGE = "/og-image.jpg";
