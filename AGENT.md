# AGENT.md

Cursor/AI 에이전트가 이 저장소에서 작업할 때 참고하는 규칙 문서입니다.

## 프로젝트

- 이사 소비자 ↔ 이사 전문가 매칭 서비스 "무빙(MOVING)" 프론트엔드
- 상세 소개/기능/팀 규칙은 `README.md` 참고

## 기술 스택

- Next.js 16 (App Router) · React 19 · TypeScript 6
- Tailwind CSS 4
- TanStack Query 5 (서버 상태)
- React Hook Form 7 (폼)
- ESLint 9 (eslint-config-next 기반) · Prettier 3 (포맷) · husky + lint-staged + commitlint (커밋 전 자동 검사)

## 프로젝트 구조

```text
src/
├── app/
│   ├── (auth)/           # 인증 플로우 라우트 그룹 (URL에 노출 안 됨)
│   │   ├── customer/     # 일반 유저 회원가입/로그인 (URL: /customer/...)
│   │   │   └── layout.tsx
│   │   └── mover/        # 기사님 회원가입/로그인 (URL: /mover/...)
│   │       └── layout.tsx
│   ├── (main)/           # 메인 서비스 라우트 그룹
│   │   └── page.tsx      # 루트("/") 랜딩 페이지
│   ├── layout.tsx        # 루트 레이아웃
│   ├── providers.tsx     # Provider 조립 (QueryProvider 등), RootLayout에서 사용
│   ├── not-found.tsx
│   ├── loading.tsx
│   └── globals.css       # 디자인 토큰(@theme) · 폰트 · 반응형 브레이크포인트
├── assets/
│   ├── fonts/            # PretendardVariable.ttf (next/font/local)
│   ├── icons/            # SVG 아이콘
│   └── images/           # common/, landing/ 등 목적별 하위 폴더
├── components/
│   └── common/           # 공통 컴포넌트
├── hooks/                # 커스텀 훅
├── lib/
│   ├── actions/          # 서버 액션
│   ├── services/         # API 호출 함수
│   └── utils/            # 순수 유틸 함수
└── providers/            # QueryProvider 등 개별 provider 구현체
```

- `customer` / `mover`는 (같은 `/login` 등 페이지명이 겹쳐서) URL 충돌 방지 위해 일반 폴더로 분리 — `/customer/...`, `/mover/...`. 각자 `layout.tsx`에서 공통 UI/가드 처리
- 절대경로 import는 `@/*` → `src/*` 로 매핑되어 있음 (`tsconfig.json`)
  - 예: `import { X } from "@/app/..."`
- `types/`, `constants/`는 필요해지는 시점에 추가 (현재는 미생성)

## 코딩 규칙

- 컴포넌트는 함수형 + TypeScript로 작성, `strict` 모드 위반 없도록 타입 명시
- 클라이언트 컴포넌트가 필요할 때만 최상단에 `"use client"` 명시 (기본은 서버 컴포넌트)
- 서버 상태(API 데이터)는 TanStack Query로, 폼 상태는 React Hook Form으로 관리 — `useState`로 중복 관리하지 않음
- 클래스명 조합은 `clsx` 사용
- children만 받는 컴포넌트는 직접 타입 정의 대신 React `PropsWithChildren` 사용
- 새 provider(예: `AuthProvider`, `ModalProvider`)는 `src/providers/`에 구현체 먼저 만들고, `src/app/providers.tsx`에서 import해서 조립 (RootLayout이 직접 여러 provider를 감싸지 않도록)
- 파일명은 kebab-case (예: `query-provider.tsx`) — Next.js가 이름을 강제하는 특수 파일(`page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx` 등)은 예외. `check-file` ESLint 룰로 강제됨 (자동수정 안 됨, 직접 이름 변경 필요)
- import는 `@/` 절대경로 사용, 상위 폴더 상대경로(`../`) 금지 (ESLint `no-restricted-imports`로 강제됨) — 같은 폴더 내 `./`는 허용
- 안 쓰는 import는 `eslint --fix` 시 자동 삭제됨 (`eslint-plugin-unused-imports`), 안 쓰는 변수는 `_` 접두어로 무시 처리
- 빈 줄 2개 이상 연속 금지 (`no-multiple-empty-lines`, `--fix` 시 1개로 자동 압축)
- 코드 포맷(따옴표·들여쓰기·줄바꿈)은 Prettier(`.prettierrc.json`)가 담당 — ESLint 룰과 역할 안 겹침
- 새 코드 작성 후 `npm run lint` 통과 확인. 어차피 `git commit` 시 lint-staged가 스테이징된 파일에 자동으로 `eslint --fix` + `prettier --write`를 돌리지만, `no-restricted-imports`·`check-file` 위반은 자동수정 안 되고 커밋이 막히니 미리 확인할 것

## 커밋 컨벤션

commitlint로 강제됨 (`commitlint.config.js`), 아래 타입만 허용:

| 타입       | 설명             |
| ---------- | ---------------- |
| `feat`     | 새로운 기능 추가 |
| `fix`      | 버그 수정        |
| `chore`    | 빌드 · 설정 변경 |
| `test`     | 테스트 코드      |
| `refactor` | 코드 리팩토링    |

형식: `type: subject` (husky pre-commit/commit-msg 훅으로 검증됨)

## 브랜치 전략

```text
main        운영 배포
 └── dev    개발 통합 (기본 브랜치)
      └── {type}/{작업명}-{이슈번호}   예: feat/mover-list-page-18
```

- 이슈 생성 시 브랜치 함께 생성 → 작업 후 `dev`로 PR → Squash and Merge
- `dev` 병합에는 승인 2명 필요

## 자주 쓰는 명령어

```bash
npm run dev            # 개발 서버
npm run build          # 프로덕션 빌드
npm run lint           # 린트 검사
npx eslint . --fix     # 린트 자동수정까지
npm run format         # Prettier 전체 덮어쓰기
npm run format:check   # Prettier 검사만 (안 고침)
```

## 주의사항

- `node_modules`, `.next`, `out`, `build`는 수정 대상 아님 (ESLint에서도 ignore)
- 환경 변수는 `.env.example` 참고해서 local의 `.env`에 설정
- `.vscode/settings.json`은 저장소에 커밋되어 있음 — `formatOnType`/`formatOnPaste`를 꺼서 저장 시에만 포맷되게 함 (타이핑 중 자동수정이 겹쳐 파일이 깨지는 문제를 막기 위함). 임의로 되돌리지 말 것
- 세부 자동화 설정(ESLint 룰별 이유, Prettier 옵션, pre-commit 동작)은 `CODE-QUALITY-AUTOMATION.md` 참고
