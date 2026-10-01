/**
 * 클라이언트·서버·Edge가 공유하는 Sentry 설정입니다.
 *
 * 세 런타임이 각자 `Sentry.init()`을 부르지만 옵션은 같아야 해서 한곳에 모읍니다.
 */

/**
 * ⚠️ `NODE_ENV`로는 환경을 구분할 수 없습니다.
 *
 * Next.js는 `next dev`가 아닌 모든 명령에서 `NODE_ENV`를 `production`으로 둡니다.
 * Vercel 프리뷰 배포도 `next build`로 돌아가므로 프로덕션과 값이 같아, 그대로 쓰면
 * 프리뷰 에러와 운영 에러가 Sentry에서 섞이고 같은 쿼터(월 5,000건)를 나눠 씁니다.
 *
 * `NEXT_PUBLIC_VERCEL_ENV`는 Vercel이 주입하며 `production` / `preview` / `development`로 갈립니다.
 * Vercel 밖(로컬)에서는 없으므로 `NODE_ENV`로 떨어집니다.
 */
export const sentryEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV;

/**
 * 우리 코드로 고칠 수 없는 에러는 보내지 않습니다.
 *
 * 브라우저 확장·광고 차단기·네트워크 끊김에서 오는 것들이라 대응할 수단이 없는데,
 * 사용자 수에 비례해 쌓여서 **진짜 에러가 들어올 쿼터를 먼저 소진**시킵니다.
 */
export const sentryIgnoreErrors = [
  // 레이아웃 계산 중 발생하는 브라우저 경고. 실제 동작에는 영향이 없습니다.
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications",

  // 네트워크 끊김·사용자가 페이지를 떠나면서 중단된 요청
  "Failed to fetch",
  "NetworkError when attempting to fetch resource",
  "Load failed",
  "AbortError",

  // 브라우저 확장 프로그램이 주입한 스크립트에서 나는 에러
  "Extension context invalidated",
  "chrome-extension://",
  "moz-extension://",

  // 외부 스크립트에서 난 에러라 스택을 알 수 없는 경우
  "Script error.",
];

/** 세 런타임이 공유하는 기본 옵션 */
export const sentryBaseOptions = {
  environment: sentryEnvironment,

  // 무료 플랜은 월 5,000 이벤트입니다. 성능 추적은 모든 요청·페이지 이동을 기록해
  // 할당량을 금방 소진하므로 끄고, 에러만 수집합니다.
  tracesSampleRate: 0,

  ignoreErrors: sentryIgnoreErrors,
} as const;
