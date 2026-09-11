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
- ESLint 9 (eslint-config-next 기반) · Prettier 3 + prettier-plugin-tailwindcss (포맷, 클래스 자동 정렬) · husky + lint-staged + commitlint (커밋 전 자동 검사)

## 버전 관리

| 항목       | 버전 |
| ---------- | ---- |
| TypeScript | 6.x  |
| Next.js    | 16.x |
| React      | 19.x |

- 패키지 추가 시 팀에 공유
- 메이저 버전 업그레이드는 회의에서 결정

## 프로젝트 구조

```text
src/
├── app/
│   ├── (auth)/           # 인증 플로우 라우트 그룹 (URL에 노출 안 됨)
│   │   ├── customer/     # 일반 유저 회원가입/로그인 (URL: /customer/...)
│   │   │   └── layout.tsx
│   │   └── mover/        # 기사님 회원가입/로그인 (URL: /mover/...)
│   │       └── layout.tsx
│   ├── (main)/           # 메인 서비스 라우트 그룹 (공개 페이지, 로그인 불필요)
│   │   └── page.tsx      # 루트("/") 랜딩 페이지
│   ├── (protected)/      # 로그인 필요한 페이지, role별 분기
│   │   ├── customer/     # 일반 유저 전용 (마이페이지 등, URL: /customer/...)
│   │   │   └── layout.tsx
│   │   └── mover/        # 기사님 전용 (대시보드 등, URL: /mover/...)
│   │       └── layout.tsx
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
│   ├── common/           # 2개 이상 도메인에서 재사용되는 범용 UI (Button, Modal, Tab, Header 등)
│   ├── layout/           # GNB 등 레이아웃 전용
│   ├── mover/            # 기사 도메인 전용 (CardMover, MoverMeta 등)
│   ├── review/           # 리뷰 도메인 전용
│   ├── quote/            # 견적 도메인 전용
│   ├── address/          # 주소 도메인 전용
│   └── filter/           # 검색/필터 도메인 전용 (지역·이사종류 칩 포함)
├── hooks/                # 커스텀 훅
├── lib/
│   ├── actions/          # 서버 액션
│   ├── services/         # API 호출 함수
│   └── utils/            # 순수 유틸 함수
└── providers/            # QueryProvider 등 개별 provider 구현체
```

- `components/` 배치 기준: 2개 이상 도메인(기사/리뷰/견적/주소/필터 등)에서 재사용 + 특정 도메인 데이터 모양에 의존 안 함 → `common/`. 특정 도메인 전용이면 해당 도메인 폴더(`mover/`, `review/`, `quote/`, `address/`, `filter/`, `layout/`)로
- `customer` / `mover`는 (같은 `/login` 등 페이지명이 겹쳐서) URL 충돌 방지 위해 일반 폴더로 분리 — `/customer/...`, `/mover/...`. 각자 `layout.tsx`에서 공통 UI/가드 처리
- `(auth)/customer`·`(protected)/customer` (mover도 동일)처럼 같은 이름 폴더가 서로 다른 그룹에 있을 수 있음 — 그룹은 URL에 안 보이니 두 그룹에 걸쳐 같은 하위 경로(예: 양쪽에 `page.tsx` 루트)를 만들면 URL 충돌남. `(auth)`는 로그인/회원가입, `(protected)`는 로그인 후 페이지로 하위 경로 안 겹치게 유지
- 절대경로 import는 `@/*` → `src/*` 로 매핑되어 있음 (`tsconfig.json`)
  - 예: `import { X } from "@/app/..."`
- `types/`, `constants/`는 필요해지는 시점에 추가 (현재는 미생성)

## 네이밍 컨벤션

### 공통

| 대상              | 케이스                        | 예시                                |
| ----------------- | ----------------------------- | ----------------------------------- |
| 변수              | camelCase                     | `moverProfile`, `isTargeted`        |
| 상수              | UPPER_SNAKE_CASE              | `MAX_ESTIMATE_COUNT`, `ERROR_CODES` |
| 함수              | camelCase                     | `createNotification`, `findByEmail` |
| 타입 · 인터페이스 | PascalCase                    | `AuthResult`, `CreateEstimateDto`   |
| Enum              | PascalCase (값은 UPPER_SNAKE) | `UserRole.CUSTOMER`                 |

### 함수 이름 접두어

| 접두어       | 용도               | 예시                       |
| ------------ | ------------------ | -------------------------- |
| `get`        | 조회 (없으면 에러) | `getUserById`              |
| `find`       | 조회 (없으면 null) | `findByEmailAndRole`       |
| `create`     | 생성               | `createQuotationRequest`   |
| `update`     | 수정               | `updateMoverProfile`       |
| `delete`     | 삭제               | `deleteFavorite`           |
| `is` / `has` | boolean 반환       | `isTargeted`, `hasProfile` |

### 파일 · 폴더

> 컴포넌트 파일(`src/components/**`)·provider 파일(`src/providers/**`)은 PascalCase, 훅 파일(`src/hooks/**`)은 camelCase, 그 외 파일명은 kebab-case로 통일. Next.js가 이름을 강제하는 특수 파일(`page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx` 등)만 예외. `check-file` ESLint 룰로 강제됨 (자동수정 안 됨, 직접 이름 변경 필요)

| 대상          | 케이스                                             | 예시                                                 |
| ------------- | -------------------------------------------------- | ---------------------------------------------------- |
| 컴포넌트 파일 | PascalCase                                         | `MoverCard.tsx`                                      |
| provider 파일 | PascalCase                                         | `AuthProvider.tsx`                                   |
| 훅 파일       | camelCase (`use` 접두어)                           | `useMoverList.ts`                                    |
| `lib/` 파일   | kebab-case (역할 접미사는 하이픈, dot-suffix 금지) | `auth-service.ts`, `api-client.ts`, `format-date.ts` |
| 라우트 폴더   | kebab-case                                         | `app/quotation-request/`                             |
| 일반 폴더     | kebab-case                                         | `components/mover/`, `hooks/`                        |

### API 엔드포인트 (참고: BE가 정의, FE는 이 규칙대로 호출)

| 규칙               | 예시                                   |
| ------------------ | -------------------------------------- |
| kebab-case 복수형  | `/api/quotation-requests`              |
| 하위 리소스는 중첩 | `/api/quotation-requests/{id}/targets` |
| 동작은 동사        | `/api/estimates/{id}/confirm`          |

## 코딩 규칙

- 컴포넌트는 함수형 + TypeScript로 작성, `strict` 모드 위반 없도록 타입 명시
- `any` 사용 금지 (불가피하면 `unknown` + 타입 가드)
- 주석은 **왜**를 설명 (무엇을 하는지는 코드로)
- 클라이언트 컴포넌트가 필요할 때만 최상단에 `"use client"` 명시 (기본은 서버 컴포넌트)
- 서버 상태(API 데이터)는 TanStack Query로, 폼 상태는 React Hook Form으로 관리 — `useState`로 중복 관리하지 않음
- 클래스명 조합은 `clsx` 사용
- children만 받는 컴포넌트는 `{ children: ReactNode }`로 직접 타입 정의 — `PropsWithChildren`은 `children`을 옵셔널로 만들어서 안티패턴, 사용 금지
- 타입 정의: 컴포넌트 Props·객체 모양(shape)은 `interface`, Union·Intersection·함수 타입·primitive alias는 `type` 사용
- 타입 위치: 여러 곳에서 쓰는 공용 타입은 `src/types/`, 컴포넌트 전용 Props 타입은 해당 컴포넌트 파일에 로컬로 정의
- 새 provider(예: `AuthProvider`, `ModalProvider`)는 `src/providers/`에 구현체 먼저 만들고, `src/app/providers.tsx`에서 import해서 조립 (RootLayout이 직접 여러 provider를 감싸지 않도록)
- import는 `@/` 절대경로 사용, 상위 폴더 상대경로(`../`) 금지 (ESLint `no-restricted-imports`로 강제됨) — 같은 폴더 내 `./`는 허용
- 안 쓰는 import는 `eslint --fix` 시 자동 삭제됨 (`eslint-plugin-unused-imports`), 안 쓰는 변수는 `_` 접두어로 무시 처리
- 빈 줄 2개 이상 연속 금지 (`no-multiple-empty-lines`, `--fix` 시 1개로 자동 압축)
- 코드 포맷(따옴표·들여쓰기·줄바꿈)은 Prettier(`.prettierrc.json`)가 담당 — ESLint 룰과 역할 안 겹침
- 새 코드 작성 후 `npm run lint` 통과 확인. 어차피 `git commit` 시 lint-staged가 스테이징된 파일에 자동으로 `eslint --fix` + `prettier --write`를 돌리지만, `no-restricted-imports`·`check-file` 위반은 자동수정 안 되고 커밋이 막히니 미리 확인할 것

## API 응답 형식 (참고: BE 응답 계약, FE 타입 정의 시 기준)

```json
// 성공
{ "data": { ... } }

// 목록 (커서)
{ "data": [...], "nextCursor": "...", "hasNext": true }

// 목록 (페이지)
{ "data": [...], "page": 1, "totalPages": 5, "totalCount": 47 }

// 실패
{ "error": { "code": "ACTIVE_REQUEST_EXISTS", "message": "..." } }
```

## 커밋 컨벤션

commitlint로 강제됨 (`commitlint.config.js`), 아래 타입만 허용:

| 타입       | 설명             |
| ---------- | ---------------- |
| `feat`     | 새로운 기능 추가 |
| `fix`      | 버그 수정        |
| `chore`    | 빌드 · 설정 변경 |
| `test`     | 테스트 코드      |
| `refactor` | 코드 리팩토링    |

형식: `{type}: {내용}` (husky pre-commit/commit-msg 훅으로 검증됨). 새로 이 저장소를 받은 팀원은 최초 1회 `npm install`을 실행해야 훅이 적용됨.

### 내용 작성 규칙

| 구분              | 형식                              | 예시                                     |
| ----------------- | --------------------------------- | ---------------------------------------- |
| 공통 컴포넌트     | `공통 컴포넌트 {컴포넌트명} 작업` | `feat: 공통 컴포넌트 GNB 작업`           |
| 페이지 (퍼블리싱) | `{페이지명} 퍼블리싱 작업`        | `feat: 기사님 찾기 페이지 퍼블리싱 작업` |
| 페이지 (로직)     | `{페이지명} 기능 작업`            | `feat: 기사님 찾기 페이지 기능 작업`     |
| 리팩토링          | `{작업명} 리팩토링 작업`          | `refactor: 견적 서비스 리팩토링 작업`    |
| 설정              | `{작업명} 설정 작업`              | `chore: husky 설정 작업`                 |
| 그 외             | `{작업명} 기타 작업`              | `feat: GNB 알림 기능 기타 작업`          |

## 브랜치 전략

```text
main        운영 배포
 └── dev    개발 통합 (기본 브랜치)
      └── {type}/{작업명}-{이슈번호}   예: feat/mover-list-page-18
```

- `main`, `dev`는 **직접 push 불가** (룰셋 보호)
- `dev` 머지: 승인 **2명** / `main` 머지: 승인 **1명**
- **Squash and Merge**로 병합, 머지 후 브랜치 자동 삭제
- 이슈 생성 후 원격에 브랜치 수동 생성 → 작업 후 `dev`로 PR

### 브랜치 네이밍

`{type}/{작업명}-{이슈번호}`

| 규칙     | 내용                                                      |
| -------- | --------------------------------------------------------- |
| type     | 커밋 타입과 동일 (`feat` `fix` `chore` `test` `refactor`) |
| 구분자   | type과 작업명 사이는 `/`, 그 뒤는 전부 `-`                |
| 작업명   | 영문 소문자 케밥케이스                                    |
| 이슈번호 | 맨 뒤에 숫자만                                            |
| 언어     | 영문만 사용 (한글은 터미널에서 다루기 번거로움)           |

- 컴포넌트 작업 시: `{type}/component-{작업명}-{이슈번호}` (예: `feat/component-mover-card-21`)
- 브랜치는 이슈 생성 후 원격에 수동으로 직접 생성 (GitHub 자동 브랜치 생성 기능 안 씀)

## PR & Issue

### 이슈

- 템플릿 5종 사용 (`feat` `fix` `chore` `test` `refactor`)
- 이슈 생성 시 브랜치를 함께 생성
- Projects 보드에 연결 (`무빙_FE`)

### PR

- 템플릿의 모든 항목을 채움
- **Linked Issue**에 `close #번호`를 반드시 작성 (머지 시 이슈 자동 종료)
- 리뷰어: 팀장 고정 + 각자 팀원 1명 (팀장이 팀원인 조는 지정하고 싶은 사람으로 지정)
- 코드 리뷰는 24시간 내 완료

## 자주 쓰는 명령어

```bash
npm run dev            # 개발 서버
npm run build          # 프로덕션 빌드
npm run lint           # 린트 검사
npx eslint . --fix     # 린트 자동수정까지
npm run format         # Prettier 전체 덮어쓰기
npm run format:check   # Prettier 검사만 (안 고침)
```

## MCP 작업 시 유의사항

- 이미지·아이콘 등 에셋은 `src/assets/`에 이미 준비되어 있음 — 피그마 MCP 등으로 작업할 때 새로 다운로드하지 말고 기존 `assets/` 폴더 안에서 참조할 것

## 주의사항

- `node_modules`, `.next`, `out`, `build`는 수정 대상 아님 (ESLint에서도 ignore)
- 환경 변수는 `.env`에 두고 절대 커밋하지 않음. `.env.example` 참고해서 local의 `.env`에 설정하고, 새 환경변수 추가 시 `.env.example`에도 반드시 추가하고 팀에 공지
- `.vscode/settings.json`은 저장소에 커밋되어 있음 — `formatOnType`/`formatOnPaste`를 꺼서 저장 시에만 포맷되게 함 (타이핑 중 자동수정이 겹쳐 파일이 깨지는 문제를 막기 위함). 임의로 되돌리지 말 것
- 세부 자동화 설정(ESLint 룰별 이유, Prettier 옵션, pre-commit 동작)은 `CODE-QUALITY-AUTOMATION.md` 참고
