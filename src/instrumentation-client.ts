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

    // Replay 는 기본 통합(`getDefaultIntegrations`)에 **포함돼 있지 않습니다.**
    // 샘플레이트만 올려두면 녹화 자체가 시작되지 않아 조용히 아무 일도 안 일어납니다.
    integrations: [Sentry.replayIntegration()],

    // Session Replay — **에러가 났을 때만** 녹화합니다.
    //
    // 평소에는 직전 1분치만 메모리에 들고 있다가(버퍼 모드) 아무것도 보내지 않고,
    // 에러가 발생한 순간 그 1분 + 이후 구간을 전송합니다. 에러 리포트만으로는
    // "무슨 조작을 해서 터졌는지"를 알 수 없는데, 재생으로 클릭 순서가 그대로 보입니다.
    //
    // ⚠️ 무료 플랜의 replay 쿼터는 **월 50건**입니다(에러는 5,000건).
    // 같은 에러가 반복되면 금방 소진되므로, 운영이 길어지면 비율을 낮추세요.
    // 지금은 남은 기간이 짧고 데모에서 나는 에러가 가장 중요해 100%로 둡니다.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // 마스킹은 **기본값을 그대로 둡니다.**
    // `maskAllText` · `maskAllInputs` · `blockAllMedia` 가 모두 기본 `true` 라
    // 텍스트는 `*` 로 가려지고 입력값·이미지도 녹화되지 않습니다.
    // 비밀번호 필드는 그 위에 Sentry 가 별도로 특수 취급합니다.
    // 여기서 `maskAllInputs: false` 같은 걸 넣으면 **보호가 풀리니 주의하세요.**
  });
}

// 라우터 전환을 Sentry가 추적할 수 있게 넘겨줍니다.
// `tracesSampleRate: 0`이라 실제 전송은 없지만, Next가 이 export를 요구합니다.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
