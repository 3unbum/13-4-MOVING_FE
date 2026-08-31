<div align="center">

# 🚚 무빙 (MOVING)

**이사 소비자와 이사 전문가를 연결하는 매칭 서비스**

코드잇 스프린트 13기 · 파트4 고급 프로젝트 · 4팀

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Backend Repository](https://github.com/3unbum/13-4-MOVING_BE)

</div>

<br />

## 📖 프로젝트 소개

이사 시장에는 무분별한 가격 책정과 무책임한 서비스로 인해 **정보의 투명성과 신뢰도가 낮은 문제**가 있습니다.

무빙은 소비자가 원하는 서비스와 주거 정보를 입력하면 이사 전문가들이 견적을 제공하고, 사용자가 이를 바탕으로 전문가를 선정할 수 있는 매칭 서비스입니다. 소비자는 견적과 이전 고객들의 후기를 확인하며 신뢰할 수 있는 전문가를 선택할 수 있습니다.

<br />

## ✨ 주요 기능

| 일반 유저                       | 기사님                   |
| ------------------------------- | ------------------------ |
| 견적 요청 (이사 종류·날짜·주소) | 받은 요청 조회 및 필터링 |
| 기사님 검색 · 필터 · 정렬       | 견적 보내기 / 반려하기   |
| 지정 견적 요청 (최대 3명)       | 내 견적 관리 (확정·반려) |
| 받은 견적 비교 및 확정          | 마이 페이지 · 받은 리뷰  |
| 찜하기 · 리뷰 작성              | 프로필 관리              |

- **유저 타입별 인증** — 일반 유저와 기사님이 각각 다른 회원가입·로그인 플로우
- **소셜 로그인** — 구글 · 네이버 · 카카오
- **무한 스크롤** — 기사님 목록 조회
- **반응형** — Mobile · Tablet · Desktop

<br />

## 🛠 기술 스택

| 구분             | 기술                     |
| ---------------- | ------------------------ |
| **Framework**    | Next.js 16 (App Router)  |
| **Language**     | TypeScript               |
| **UI**           | React 19, Tailwind CSS 4 |
| **State / Data** | TanStack Query           |
| **Form**         | React Hook Form          |
| **Lint**         | ESLint                   |

<br />

## 🚀 시작하기

### 요구 사항

- Node.js 20 이상
- npm

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/3unbum/13-4-MOVING_FE.git
cd 13-4-MOVING_FE

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # 린트 검사
```

<br />

## 📁 프로젝트 구조

```
src/
└── app/              # App Router
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

<br />

## 🌿 브랜치 전략

```
main        운영 배포
 └── dev    개발 통합 (기본 브랜치)
      └── feat-기능이름-이슈번호
```

- 이슈 생성 시 브랜치를 함께 생성합니다
- 작업 완료 후 `dev`로 PR을 올립니다
- **Squash and Merge**로 병합합니다

### 커밋 컨벤션

| 타입       | 설명             |
| ---------- | ---------------- |
| `feat`     | 새로운 기능 추가 |
| `fix`      | 버그 수정        |
| `chore`    | 빌드 · 설정 변경 |
| `test`     | 테스트 코드      |
| `refactor` | 코드 리팩토링    |

<br />

## 🤝 팀 규칙

- 코드 리뷰는 **24시간 내**에 완료합니다
- `dev` 브랜치 병합에는 **승인 2명**이 필요합니다
- 4시간 동안 해결되지 않는 문제는 팀에 공유합니다
- 데일리 스크럼은 전날 퇴실 전 최신화합니다

<br />

## 👥 팀원

| 이름   | 역할               |
| ------ | ------------------ |
| 이은범 | 팀장 · 견적 / 랜딩 |
| 송현규 | 견적 / 랜딩        |
| 김민수 | 회원 / 프로필      |
| 조서현 | 회원 / 프로필      |
| 문치호 | 기사님 찾기 / 리뷰 |
| 김은진 | 기사님 찾기 / 리뷰 |

<div align="center">
<br />

**코드잇 스프린트 13기 파트4 · 4팀**

</div>
