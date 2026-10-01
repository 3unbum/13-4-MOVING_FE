/**
 * 브라우저에서 실행되는 Sentry 초기화입니다.
 *
 * Next.js가 앱이 상호작용 가능해지기 전에 이 파일을 실행합니다
 * (`instrumentation-client.ts`는 Next의 파일 규약이라 따로 import하지 않습니다).
 *
 * DSN이 없으면 초기화하지 않습니다. 로컬 개발에는 값이 없으니 자동으로 꺼집니다.
 */
import * as Sentry from "@sentry/nextjs";
// `instrumentation*.ts` 는 Next의 특수 진입점이라 일반 소스와 번들 경로가 달라,
// 경로 별칭 대신 상대경로로 둡니다.
import { sentryBaseOptions } from "./sentry-options";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    ...sentryBaseOptions,

    // Session Replay는 쿼터를 빠르게 쓰므로 켜지 않습니다.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

// 라우터 전환을 Sentry가 추적할 수 있게 넘겨줍니다.
// `tracesSampleRate: 0`이라 실제 전송은 없지만, Next가 이 export를 요구합니다.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
