# 코드 품질 자동화 (Prettier · ESLint · pre-commit · 에디터)

AGENT.md / 팀 컨벤션 문서에서 참조하는 세부 설정 문서입니다.

## Prettier (자동 포맷)

`.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5",
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- `prettier-plugin-tailwindcss`: Tailwind 클래스 순서를 규칙대로 자동 정렬 (Tailwind v4 CSS 기반 설정을 자동 인식, 별도 config 불필요)
- `.prettierignore`: `node_modules`, `.next`, `out`, `build`, `next-env.d.ts` 제외
- 명령어: `npm run format` (전체 덮어쓰기), `npm run format:check` (검사만, 안 고침)

## ESLint (`eslint.config.mjs`)

`eslint-config-next`(core-web-vitals + typescript) 기반에 아래 커스텀 룰 추가:

| 룰                                      | 내용                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| `no-restricted-imports`                 | 상위 폴더 상대경로(`../`) import 금지 → `@/` 절대경로 사용 (같은 폴더 `./`는 허용)      |
| `unused-imports/no-unused-imports`      | 안 쓰는 import는 `--fix` 시 자동 삭제 (`@typescript-eslint/no-unused-vars`는 대신 꺼둠) |
| `unused-imports/no-unused-vars`         | 안 쓰는 변수는 warning (`_` 접두어 붙이면 무시)                                         |
| `no-multiple-empty-lines`               | 빈 줄 2개 이상 연속되면 `--fix` 시 1개로 압축, 파일 끝 빈 줄은 0개                      |
| `check-file/filename-naming-convention` | `src/**/*.ts(x)` 파일명은 kebab-case 강제 (자동수정 안 됨, 직접 이름 바꿔야 통과)       |

- 명령어: `npm run lint` (검사만), `npx eslint . --fix` (자동수정까지)

## 커밋 전 자동 검사 (pre-commit)

`git commit` 실행 시 아래 순서로 자동 검사됨. 작성자가 따로 실행할 명령어는 없음 (평소처럼 `git add` · `git commit`만 하면 됨).

1. **pre-commit (lint-staged)** — 스테이징된 파일만 검사
   - `*.ts, *.tsx, *.js, *.jsx, *.mjs` → `eslint --fix` 실행 후 `prettier --write`
   - `*.json, *.css, *.md` → `prettier --write`
   - **자동으로 고쳐지는 것**: 코드 포맷(따옴표·들여쓰기·줄바꿈), Tailwind 클래스 순서, 빈 줄 2개 이상 연속, 안 쓰는 import
   - **자동으로 안 고쳐지고 커밋이 막히는 것**: 상위 폴더 상대경로(`../`) import 사용, kebab-case 아닌 파일명 등 — 이 경우 터미널(또는 VSCode Source Control 출력창)에 어떤 파일 몇 번째 줄에서 무슨 규칙에 걸렸는지 에러로 뜨며, **직접 코드를 고쳐야** 커밋이 진행됨
2. **commit-msg (commitlint)** — 커밋 메시지 형식 검사 (`{type}: {내용}`, type 5종만 허용)

> 새로 이 저장소를 받는 팀원은 최초 1회 `npm install`을 실행해야 `pre-commit`/`commit-msg` 훅이 정상 동작함.

## 에디터 설정 (`.vscode/settings.json`, 저장소에 커밋됨)

- 워크스페이스 설정이라 팀원 개인 설정과 무관하게 적용됨 (단, `editor.codeActionsOnSave`는 키 단위로 병합되니 개인 설정에만 있고 워크스페이스엔 없는 키는 살아남음 — 그래서 충돌 나는 키들은 워크스페이스에서 `"never"`로 명시해둠)
- `editor.formatOnSave: true` / `editor.formatOnType: false` / `editor.formatOnPaste: false`
- `editor.codeActionsOnSave`: `source.fixAll.eslint`만 켬, `source.fixAll` · `source.organizeImports` · `source.removeUnusedImports`는 `"never"`로 명시 차단 (안 그러면 저장할 때 여러 자동수정이 동시에 돌면서 문서가 깨지는 경우가 있었음)
- 기본 포맷터는 Prettier로 고정 (`.js/.jsx/.ts/.tsx/.json/.css`)
- `.vscode/extensions.json`으로 ESLint · Prettier 확장 추천
