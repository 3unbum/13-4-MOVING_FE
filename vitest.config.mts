import { defineConfig } from "vitest/config";

/**
 * 유틸 함수 단위 테스트 설정.
 *
 * 컴포넌트 렌더 테스트는 아직 없습니다 — jsdom·setup 파일이 붙으면 설정이 커져서
 * 의존성 없는 순수 함수부터 덮었습니다. 나중에 컴포넌트를 다루게 되면
 * `environment: "jsdom"`과 `setupFiles`를 여기에 추가하면 됩니다.
 *
 * 확장자가 `.mts`인 이유 — 이 프로젝트 `package.json`에는 `"type": "module"`이 없어
 * `.ts` 설정 파일은 CommonJS로 읽히면서 ESM 경고가 납니다.
 */
export default defineConfig({
  // `tsconfig.json`의 `@/*` 별칭을 테스트에서도 그대로 씁니다 (vite 내장 기능).
  resolve: { tsconfigPaths: true },
  test: {
    // 기본값(node)으로 둡니다. 날짜·금액 포맷은 브라우저 API가 필요 없습니다.
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      /**
       * 분모는 `src/lib` 전체입니다.
       *
       * 테스트한 파일만 넣으면 100%가 나오지만, 그 숫자는 "무엇이 안 덮였는지"를
       * 숨깁니다. 지금은 러너를 들인 첫 단계라 **남은 범위가 보이는 편**이 낫습니다.
       * 리포트의 0% 행이 다음에 덮을 목록입니다.
       *
       * 컴포넌트·훅은 아직 범위 밖이라 `src/lib`로 한정합니다.
       */
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts"],
    },
  },
});
