# 라우팅 그룹 & 인증 가드

Figma 페이지 플로우([node-id=1-745](https://www.figma.com/design/cLQdJgWP4v7gBvszwZpIwl/-%EC%8A%A4%ED%94%84%EB%A6%B0%ED%84%B0-%EA%B3%B5%EC%9C%A0%EC%9A%A9--%EB%AC%B4%EB%B9%99_V2--%EB%B3%B5%EC%82%AC-?node-id=1-745))에 맞춰 라우팅 그룹을 정리하고, `(auth)`/`(protected)` 그룹에 role 기반 레이아웃 가드를 붙인 내용 정리.

## 아키텍처: 클라이언트 가드

`AuthProvider`(`src/providers/auth-provider.tsx`)가 이미 클라이언트 전용 구조(`"use client"`, `/auth/me` 호출)라 서버 컴포넌트에서 재사용 불가. 그래서 서버 `requireRole` 헬퍼를 새로 만드는 대신, 기존 `AuthProvider`의 `useAuth()`를 그대로 쓰는 **클라이언트 훅 기반 레이아웃 가드**로 설계함.

- `src/hooks/use-role-guard.ts` — `(protected)/*` 레이아웃용
- `src/hooks/use-guest-guard.ts` — `(auth)/*` 레이아웃용

> 참고: 예전에 서버 사이드 `requireRole`/`redirectIfAuthenticated`(`src/lib/auth/require-role.ts`) 방식으로 설계했던 문서가 있었으나, 이번에 실제 구현하면서 클라이언트 훅 방식으로 결정 변경됨. 이 문서가 최신 기준.

**트레이드오프**: 클라이언트 이펙트에서 리다이렉트하기 때문에 리다이렉트 직전 한 프레임 정도 콘텐츠가 깜빡일 수 있음(flash). 완전히 막으려면 middleware.ts + 서버 세션 체크가 필요하지만 현재 스코프 밖.

## 라우팅 그룹 구조

| 그룹                   | URL                                                                                                                         | Figma 페이지                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `(main)`               | `/`                                                                                                                         | 1. 랜딩                                   |
| `(main)`               | `/movers`                                                                                                                   | 7. 기사님 찾기 (public — 비회원+일반유저) |
| `(main)`               | `/movers/[moverId]`                                                                                                         | 7-1. 기사님 상세조회 (public)             |
| `(auth)/customer`      | `/customer/login`, `/customer/signup`                                                                                       | 2, 3                                      |
| `(auth)/mover`         | `/mover/login`, `/mover/signup`                                                                                             | 13, 12                                    |
| `(protected)/customer` | `/customer/profile-register`, `/profile-edit`, `/quotation-requests`, `/my-quotes`(+`/[quoteId]`), `/favorites`, `/reviews` | 4, 5, 6, 8, 8-1, 9, 10                    |
| `(protected)/mover`    | `/mover/profile-register`, `/requests`, `/my-quotes`, `/mypage`, `/reviews`                                                 | 14, 15, 16, 17, 18                        |

## role별 정책 차이 — 제일 중요한 부분

**mover: 프로필 하드 게이트 있음**

- `(protected)/mover/layout.tsx`가 `useRoleGuard({ role: "MOVER", profileRegisterPath: "/mover/profile-register", ... })` 호출
- `hasProfile === false`면 지금 보려는 페이지가 뭐든 무조건 `/mover/profile-register`로 강제 이동 — 등록 전엔 받은요청 등 다른 페이지 접근 자체가 불가능
- 로그인 성공 시에도 동일 기준으로 분기: `hasProfile` false → profile-register, true → `/mover/requests` (`useGuestGuard`의 `homePathFor`에 이미 구현됨)

**customer: 프로필 하드 게이트 없음**

- `(protected)/customer/layout.tsx`는 `useRoleGuard`에 `profileRegisterPath`를 **넘기지 않음** → `hasProfile`이 false여도 견적요청/내견적관리/찜하기/리뷰 등 다 자유롭게 접근 가능
- 대신 회원가입 성공 시 "프로필 등록을 하시겠습니까?" **모달**로만 유도 (예 → profile-register, 아니오 → 가입 전 마지막 페이지로 복귀) — **아직 미구현**, `(auth)/customer/signup/page.tsx`에 TODO 주석만 있음
- 로그인 성공 시(`hasProfile === true`): 로그인 전 마지막 페이지가 기사님찾기(`/movers`)면 다시 기사님찾기로, 랜딩(`/`)이면 `/customer/my-quotes`로 — **아직 미구현**, `(auth)/customer/login/page.tsx`에 TODO 주석만 있음. 구현 시 `document.referrer`/`sessionStorage`(레이스 위험) 대신 로그인 링크에 `?redirect=` 쿼리파라미터 넘기는 방식 추천

## 공통 가드 규칙

- 비로그인 상태로 `(protected)/*` 접근 → 해당 role의 로그인 페이지로
- role 불일치(예: customer 계정으로 `/mover/*` 접근) → `/`로
- 이미 로그인한 상태로 `(auth)/*` 접근 → `useGuestGuard`가 자기 role의 홈으로 즉시 리다이렉트

## 관련 파일

- `src/hooks/use-role-guard.ts`, `src/hooks/use-guest-guard.ts`
- `src/app/(auth)/{customer,mover}/layout.tsx`, `src/app/(protected)/{customer,mover}/layout.tsx`
- `src/providers/auth-provider.tsx` (`AccountResponse` — `hasProfile`, `role` 필드)
