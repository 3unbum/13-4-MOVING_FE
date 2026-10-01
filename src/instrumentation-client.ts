/**
 * 브라우저에서 실행되는 Sentry 초기화입니다.
 *
 * Next.js가 앱이 상호작용 가능해지기 전에 이 파일을 실행합니다
 * (`instrumentation-client.ts`는 Next의 파일 규약이라 따로 import하지 않습니다).
 *
 * DSN이 없으면 초기화하지 않습니다. 로컬 개발에는 값이 없으니 자동으로 꺼집니다.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // 무료 플랜은 월 5,000 이벤트입니다. 성능 추적은 모든 페이지 이동을 기록해
    // 할당량을 금방 소진하므로 끄고, 에러만 수집합니다.
    tracesSampleRate: 0,

    // Session Replay도 같은 이유로 켜지 않습니다.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

// 라우터 전환을 Sentry가 추적할 수 있게 넘겨줍니다.
// `tracesSampleRate: 0`이라 실제 전송은 없지만, Next가 이 export를 요구합니다.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
