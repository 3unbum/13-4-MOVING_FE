# 라우팅 그룹 & 인증 가드

Figma 페이지 플로우([node-id=1-745](https://www.figma.com/design/cLQdJgWP4v7gBvszwZpIwl/-%EC%8A%A4%ED%94%84%EB%A6%B0%ED%84%B0-%EA%B3%B5%EC%9C%A0%EC%9A%A9--%EB%AC%B4%EB%B9%99_V2--%EB%B3%B5%EC%82%AC-?node-id=1-745))에 맞춰 라우팅 그룹을 정리하고, `(auth)`/`(protected)` 그룹에 role 기반 레이아웃 가드를 붙인 내용 정리.

## 아키텍처: 서버 컴포넌트 가드

가드 판단을 클라이언트 훅(`useAuth()`)이 아니라 **서버 컴포넌트 레이아웃**에서 한다. `src/lib/auth/find-my-account.ts`(`cache()`로 감싼 서버 전용 `/auth/me` 조회)와 `src/lib/auth/guards.ts`(`requireRole`)가 핵심.

- `(protected)/{customer,mover}/layout.tsx` — 비로그인 → role별 로그인 페이지, role 불일치 → `/`
- `(protected)/mover/(with-profile)/layout.tsx` — `hasProfile === false` → `/mover/profile-register` (mover 하드 게이트 전용, URL에는 안 드러나는 괄호 폴더)
- `(auth)/layout.tsx` — 이미 로그인한 사용자를 role별 홈으로

> 참고: 처음엔 `AuthProvider`가 클라이언트 전용이라는 이유로 클라이언트 훅(`use-role-guard.ts`/`use-guest-guard.ts`) 방식으로 갔었으나, PR #79 리뷰에서 `refetch()` 누락 시 오판·리다이렉트 목적지 이중 결정 등 캐시 동기화 문제가 지적됨. `AuthProvider`(PR #55)가 쿠키 기반 + same-origin 프록시 구조라 서버 컴포넌트에서도 쿠키로 직접 `/auth/me` 조회가 가능함을 확인하고 서버 방식으로 전환. `AuthProvider`는 GNB 등 화면 표시용으로는 그대로 유지.

**hasProfile 게이트를 `(protected)/mover/layout.tsx`가 아니라 `(with-profile)` 하위 그룹으로 분리한 이유**: role 레이아웃이 `hasProfile`을 보면 `/mover/profile-register`까지 감싸게 돼서 등록 페이지 → 등록 페이지 무한 리다이렉트가 남. 클라이언트 훅 시절엔 `usePathname()`으로 "지금이 등록 페이지면 통과" 분기로 피했지만, 서버 레이아웃은 현재 경로를 모르므로 같은 방법이 안 통함 — 대신 등록 페이지를 게이트 그룹 밖에 둬서 구조적으로 해결.

**세션 만료(fail-open)**: accessToken(1시간)만 만료되고 refreshToken(14일)이 남은 구간에서, 서버 컴포넌트는 쿠키를 쓸 수 없어 여기서 갱신이 불가능함. `requireRole`은 이 상태를 비로그인으로 리다이렉트하지 않고 통과시킨다(계정 정보는 `null` 반환) — 페이지가 뜨면 클라이언트 `AuthProvider`의 `cookieFetch`가 401을 보고 refresh해 세션을 복구하는 기존 흐름에 맡김.

**트레이드오프**: 매 그룹 진입(로그인 안 한 채 `(protected)` 접근 시도 등)마다 서버에서 `/auth/me`를 조회함 — 다만 레이아웃은 페이지 이동 시 재실행되지 않고, 같은 요청 안 중복 호출은 `cache()`로 합쳐지므로 그룹 "진입" 1회로 그침.

**`src/proxy.ts`(Next 16 기준 `middleware.ts` 대체)**: 쿠키(`accessToken`/`refreshToken`) 존재 여부만 보고 BE 호출 없이 비로그인 요청을 1차로 걷어낸다. 로그인한 유저에게는 호출량을 줄여주지 못하지만(어차피 레이아웃까지 감), 비로그인 사용자가 `(protected)` 경로를 두드리는 흔한 케이스는 `/auth/me`까지 안 가고 걸러진다. `matcher`에서 `(auth)`의 `login`/`signup` 경로는 제외 — 안 그러면 라우트 그룹이 URL에 안 드러나서 로그인 페이지가 자기 자신으로 리다이렉트되는 루프가 생김. accessToken만 확인하면 정상 로그인 유저가 1시간(accessToken 만료 주기)마다 튕기므로, 반드시 refreshToken도 같이 확인해서 **둘 다 없을 때만** 끊는다.

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

> `/requests`, `/my-quotes`, `/mypage`, `/reviews`는 실제로는 `(protected)/mover/(with-profile)/` 하위에 있음 — 괄호 폴더라 URL은 표에 적힌 그대로.

## role별 정책 차이 — 제일 중요한 부분

**mover: 프로필 하드 게이트 있음**

- `(protected)/mover/(with-profile)/layout.tsx`가 `requireRole("MOVER", "/mover/login")` 호출 후 `hasProfile === false`면 `/mover/profile-register`로 리다이렉트
- 지금 보려는 페이지가 뭐든(받은요청 등) 등록 전엔 접근 자체가 불가능 — `requests`/`my-quotes`/`mypage`/`reviews`가 전부 이 그룹 하위라 예외 없음
- 로그인 성공 시에도 동일 기준으로 분기: `hasProfile` false → profile-register, true → `/mover/requests` (`(auth)/layout.tsx`의 `homePathFor`에 구현됨)

**customer: 프로필 하드 게이트 없음**

- `(protected)/customer/layout.tsx`는 `requireRole("CUSTOMER", "/customer/login")`만 호출, hasProfile 체크 없음 → `hasProfile`이 false여도 견적요청/내견적관리/찜하기/리뷰 등 다 자유롭게 접근 가능
- 대신 회원가입 성공 시 "프로필 등록을 하시겠습니까?" **모달**로만 유도 (예 → profile-register, 아니오 → 가입 전 마지막 페이지로 복귀) — **아직 미구현**, `(auth)/customer/signup/page.tsx`에 TODO 주석만 있음
- 로그인 성공 시(`hasProfile === true`): 로그인 전 마지막 페이지가 기사님찾기(`/movers`)면 다시 기사님찾기로, 랜딩(`/`)이면 `/customer/my-quotes`로 — **아직 미구현**, `(auth)/customer/login/page.tsx`에 TODO 주석만 있음. 구현 시 `document.referrer`/`sessionStorage`(레이스 위험) 대신 로그인 링크에 `?redirect=` 쿼리파라미터 넘기는 방식 추천

## 공통 가드 규칙

- 비로그인 상태로 `(protected)/*` 접근 → 해당 role의 로그인 페이지로 (단, accessToken만 만료·refreshToken 생존 구간은 통과 — 위 fail-open 참고)
- role 불일치(예: customer 계정으로 `/mover/*` 접근) → `/`로
- 이미 로그인한 상태로 `(auth)/*` 접근 → `(auth)/layout.tsx`가 자기 role의 홈으로 즉시 리다이렉트
- mover의 `hasProfile === false` → `(with-profile)/layout.tsx`가 `/mover/profile-register`로 강제 이동 (customer는 하드 게이트 없음)
- 프로필 등록 페이지(`(protected)/{customer,mover}/profile-register/page.tsx`)는 반대로 이미 `hasProfile === true`면 각자 홈으로 되돌려보냄 (재등록 방지)

## 관련 파일

- `src/proxy.ts` — 쿠키 존재 여부 1차 필터 (BE 호출 없음)
- `src/lib/auth/find-my-account.ts` — `cache()`로 감싼 서버 전용 `/auth/me` 조회
- `src/lib/auth/guards.ts` — `requireRole(role, loginPath)`
- `src/app/(auth)/layout.tsx`, `src/app/(auth)/{customer,mover}/layout.tsx`(가드 없음, UI 자리)
- `src/app/(protected)/{customer,mover}/layout.tsx`, `src/app/(protected)/mover/(with-profile)/layout.tsx`
- `src/providers/AuthProvider.tsx` (`AccountResponse` — `hasProfile`, `role` 필드; GNB 등 화면 표시용으로 계속 사용)
