import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";
import checkFile from "eslint-plugin-check-file";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "unused-imports": unusedImports,
      "check-file": checkFile,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "상위 폴더는 상대경로(../) 대신 '@/'로 임포트하세요.",
            },
          ],
        },
      ],
      // 사용하지 않는 import는 --fix 시 자동 삭제
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      // 빈 줄 2줄 이상 연속되면 --fix 시 1줄로 압축
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      // 컴포넌트(src/components/**)·provider(src/providers/**)는 PascalCase, 훅(src/hooks/**)은 camelCase, 그 외 src 파일명은 kebab-case 강제 (자동수정 안 됨, 직접 이름 바꿔야 함)
      "check-file/filename-naming-convention": [
        "error",
        {
          "src/{components,providers}/**/*.{ts,tsx}": "PASCAL_CASE",
          "src/hooks/**/*.{ts,tsx}": "CAMEL_CASE",
          "src/!(components|providers|hooks)/**/*.{ts,tsx}": "KEBAB_CASE",
        },
        { ignoreMiddleExtensions: true },
      ],
      // 훅 파일명은 반드시 use로 시작 (camelCase 검사와 별개로 접두어 자체를 강제)
      "check-file/filename-blocklist": [
        "error",
        { "src/hooks/**/!(use*).{ts,tsx}": "" },
        { errorMessage: "Hook file names must start with use." },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
