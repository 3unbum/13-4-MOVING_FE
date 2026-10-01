/**
 * 서버·Edge 런타임의 Sentry 초기화입니다.
 *
 * `register`는 Next.js 서버 인스턴스가 뜰 때 한 번 호출됩니다.
 * `onRequestError`는 서버 컴포넌트·라우트 핸들러에서 난 에러를 받습니다.
 *
 * DSN이 없으면 초기화하지 않습니다. 로컬 개발에는 값이 없으니 자동으로 꺼집니다.
 */
import * as Sentry from "@sentry/nextjs";
// ⚠️ `@/` 별칭을 쓰면 안 됩니다. `instrumentation*.ts` 는 Next의 특수 진입점이라
// tsconfig의 `paths` 가 적용되기 전에 번들됩니다 (Vercel 빌드에서 module-not-found).
import { sentryBaseOptions } from "./sentry-options";

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  // 런타임마다 번들이 달라 조건부로 초기화합니다.
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({ dsn, ...sentryBaseOptions });
  }
}

export const onRequestError = Sentry.captureRequestError;
