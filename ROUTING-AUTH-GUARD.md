# 라우팅 그룹 & 인증 가드

Figma 페이지 플로우([node-id=1-745](https://www.figma.com/design/cLQdJgWP4v7gBvszwZpIwl/-%EC%8A%A4%ED%94%84%EB%A6%B0%ED%84%B0-%EA%B3%B5%EC%9C%A0%EC%9A%A9--%EB%AC%B4%EB%B9%99_V2--%EB%B3%B5%EC%82%AC-?node-id=1-745))에 맞춰 라우팅 그룹을 정리하고, `(auth)`/`(protected)` 그룹에 role 기반 레이아웃 가드를 붙인 내용 정리.

## 아키텍처: 서버 컴포넌트 가드

가드 판단을 클라이언트 훅(`useAuth()`)이 아니라 **서버 컴포넌트 레이아웃**에서 한다. `src/lib/auth/find-my-account.ts`(`cache()`로 감싼 서버 전용 `/auth/me` 조회)와 `src/lib/auth/guards.ts`(`requireRole`, `requireProfile`)가 핵심.

이 가드는 어디까지나 **UX용 1차 안내**다. 실제 데이터 접근은 BE의 모든 보호 API가 `requireAuth`/`requireRole`/`requireProfile`로 다시 막고 있어, FE 가드를 어떻게든 지나가도(아래 fail-open 등) 데이터는 내려가지 않는다.

- `(protected)/{customer,mover}/layout.tsx` — 비로그인 → role별 로그인 페이지, role 불일치 → `/`
- `(protected)/mover/(with-profile)/layout.tsx` — `hasProfile === false` → `/mover/profile-register` (mover 하드 게이트 전용, URL에는 안 드러나는 괄호 폴더)
- customer는 hasProfile 게이트가 필요한 페이지가 일부뿐이라 그룹으로 안 묶고, 각 페이지가 직접 `requireProfile()`을 호출(아래 "role별 정책 차이" 참고)
- `(auth)/layout.tsx` — 이미 로그인한 사용자를 role별 홈으로

> 참고: 처음엔 `AuthProvider`가 클라이언트 전용이라는 이유로 클라이언트 훅(`use-role-guard.ts`/`use-guest-guard.ts`) 방식으로 갔었으나, PR #79 리뷰에서 `refetch()` 누락 시 오판·리다이렉트 목적지 이중 결정 등 캐시 동기화 문제가 지적됨. `AuthProvider`(PR #55)가 쿠키 기반 + same-origin 프록시 구조라 서버 컴포넌트에서도 쿠키로 직접 `/auth/me` 조회가 가능함을 확인하고 서버 방식으로 전환. `AuthProvider`는 GNB 등 화면 표시용으로는 그대로 유지.

**hasProfile 게이트를 role 레이아웃이 아니라 별도 그룹/페이지에서 하는 이유**: role 레이아웃이 `hasProfile`을 보면 `profile-register`까지 감싸게 돼서 등록 페이지 → 등록 페이지 무한 리다이렉트가 남. 클라이언트 훅 시절엔 `usePathname()`으로 "지금이 등록 페이지면 통과" 분기로 피했지만, 서버 레이아웃은 현재 경로를 모르므로 같은 방법이 안 통함 — 대신 등록 페이지를 게이트 밖에 둬서 구조적으로 해결(mover는 `(with-profile)` 그룹으로, customer는 페이지별 직접 호출로).

**세션 만료(fail-open)**: accessToken(1시간)만 만료되고 refreshToken(14일)이 남은 구간에서, 서버 컴포넌트는 쿠키를 쓸 수 없어 여기서 갱신이 불가능함. `requireRole`은 이 상태를 비로그인으로 리다이렉트하지 않고 통과시킨다(계정 정보는 `null` 반환) — 페이지가 뜨면 클라이언트 `AuthProvider`의 `cookieFetch`가 401을 보고 refresh해 세션을 복구하는 기존 흐름에 맡김. `requireProfile`도 `account`가 null이면(hasProfile을 알 수 없으니) 통과시킨다.

> CodeRabbit이 "refreshToken 쿠키 존재만으로 통과시키는 게 위험하다(위조 쿠키로 우회 가능)"고 지적했고, `src/proxy.ts`에서 실제 `/auth/refresh` 검증 후 통과시키는 개선안도 검토했음. 이번 PR에서는 반영 보류 — 위에 적었듯 BE가 모든 보호 API에서 다시 막고 있어 데이터 유출로 이어지지 않고, 서버 컴포넌트가 쿠키를 못 쓰는 제약 때문에 `proxy.ts` 도입이 먼저 필요한 개선 단계 작업이라 판단. `proxy.ts`를 실제 갱신 로직으로 확장하는 시점에 같이 반영 예정.

**트레이드오프**: 매 그룹 진입(로그인 안 한 채 `(protected)` 접근 시도 등)마다 서버에서 `/auth/me`를 조회함 — 다만 레이아웃은 페이지 이동 시 재실행되지 않고, 같은 요청 안 중복 호출은 `cache()`로 합쳐지므로 그룹 "진입" 1회로 그침.

**`src/proxy.ts`(Next 16 기준 `middleware.ts` 대체)**: 쿠키(`accessToken`/`refreshToken`) 존재 여부만 보고 BE 호출 없이 비로그인 요청을 1차로 걷어낸다. 로그인한 유저에게는 호출량을 줄여주지 못하지만(어차피 레이아웃까지 감), 비로그인 사용자가 `(protected)` 경로를 두드리는 흔한 케이스는 `/auth/me`까지 안 가고 걸러진다. `matcher`에서 `(auth)`의 `login`/`signup` 경로는 제외 — 안 그러면 라우트 그룹이 URL에 안 드러나서 로그인 페이지가 자기 자신으로 리다이렉트되는 루프가 생긴다. accessToken만 확인하면 정상 로그인 유저가 1시간(accessToken 만료 주기)마다 튕기므로, 반드시 refreshToken도 같이 확인해서 **둘 다 없을 때만** 끊는다.

## 라우팅 그룹 구조

| 그룹                                         | URL                                                                                                                                                                  | Figma 페이지                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `(main)`                                     | `/`                                                                                                                                                                  | 1. 랜딩                                   |
| `(main)`                                     | `/movers`                                                                                                                                                            | 7. 기사님 찾기 (public — 비회원+일반유저) |
| `(main)`                                     | `/movers/[moverId]`                                                                                                                                                  | 7-1. 기사님 상세조회 (public)             |
| `(auth)/customer`                            | `/customer/login`, `/customer/signup`                                                                                                                                | 2, 3                                      |
| `(auth)/mover`                               | `/mover/login`, `/mover/signup`                                                                                                                                      | 13, 12                                    |
| `(protected)/customer`                       | `/customer/profile-register`, `/customer/favorites`, `/customer/reviews`, `/customer/quotation-requests`(모달 유도), `/customer/my-quotes`(게이트 없음, 빈 상태 CTA) | 4, 9, 10, 6, 8                            |
| `(protected)/customer`(페이지별 하드 게이트) | `/customer/my-quotes/[quoteId]`, `/customer/profile-edit`                                                                                                            | 8-1, 5                                    |
| `(protected)/mover`                          | `/mover/profile-register`                                                                                                                                            | 14                                        |
| `(protected)/mover/(with-profile)`           | `/mover/requests`, `/mover/my-quotes`, `/mover/mypage`, `/mover/reviews`                                                                                             | 15, 16, 17, 18                            |

> `(with-profile)`은 괄호 폴더라 URL 세그먼트에는 안 드러남 — 위 URL은 실제 접근 경로 그대로.

## role별 정책 차이 — 제일 중요한 부분

**mover: 프로필 하드 게이트 있음 (전체)**

- `(protected)/mover/(with-profile)/layout.tsx`가 `requireRole("MOVER", "/mover/login")` 호출 후 `hasProfile === false`면 `/mover/profile-register`로 리다이렉트
- 지금 보려는 페이지가 뭐든(받은요청 등) 등록 전엔 접근 자체가 불가능 — `requests`/`my-quotes`/`mypage`/`reviews`가 전부 이 그룹 하위라 예외 없음
- 로그인 성공 시에도 동일 기준으로 분기: `hasProfile` false → profile-register, true → `/mover/requests` (`(auth)/layout.tsx`의 `homePathFor`에 구현됨)

**customer: 페이지별로 하드 게이트/모달 유도가 갈림 (BE가 requireProfile 거는 페이지 기준)**

- `my-quotes`(목록)는 하드 게이트 없음 — 프로필 없어도 접근 가능. 프로필이 없으면 어차피 제출된 견적도 없으니 빈 상태로 뜨고, 거기서 "견적 요청하러 가기" CTA로 `quotation-requests`(모달 유도)로 보낸다(CTA 자체는 아직 미구현, TODO)
- `my-quotes/[quoteId]`(상세)·`profile-edit`(수정)은 하드 게이트 있음 — BE가 `내견적 상세 조회`(`GET /:id`), `프로필 수정`(`PATCH /profiles/customer`)에 `requireProfile`을 걸어놔서, 프로필 없이 들어가면 API가 `400 PROFILE_REQUIRED`를 반환하는데 이 둘은 애초에 프로필(또는 프로필 있어야만 존재하는 견적) 데이터가 없으면 보여줄 화면 자체가 없음(목록처럼 "빈 상태"로 대체할 게 없는 페이지) — 그래서 `page.tsx`가 각자 `requireRole()` 뒤에 `requireProfile(account, "/customer/profile-register")`(`src/lib/auth/guards.ts`)를 직접 호출해 `hasProfile === false`면 바로 등록 페이지로 리다이렉트(`profile-edit`은 추후 "프로필 관리"로 등록/수정을 합칠 때도 이 분기 그대로 재사용)
- `견적요청`(`/customer/quotation-requests`, BE `POST /quotation-requests`도 `requireProfile`)은 하드 게이트 대신 **모달**로 유도할 예정 — 페이지 자체는 게이트 없이 렌더. 클라이언트에서 `useAuth()`로 `hasProfile === false` 감지 시 모달 오픈(예 → `/customer/profile-register`, 아니오/닫기 → `router.back()`으로 진입 전 페이지 복귀) — **아직 미구현**, `quotation-requests/page.tsx`에 TODO 주석만 있음. 서버 게이트가 아니라 페이지 레벨이라 실제 견적 제출 mutation 시점엔 여전히 BE `400 PROFILE_REQUIRED`가 최종 방어선
- `favorites`/`reviews`/`profile-register`/`my-quotes`(목록)는 게이트 밖 — `(protected)/customer/layout.tsx`가 `requireRole("CUSTOMER", "/customer/login")`만 호출, hasProfile 체크 없이 자유롭게 접근 가능
- 대신 회원가입 성공 시 "프로필 등록을 하시겠습니까?" **모달**로만 유도 (예 → profile-register, 아니오 → 가입 전 마지막 페이지로 복귀) — **아직 미구현**, `(auth)/customer/signup/page.tsx`에 TODO 주석만 있음
- 로그인 성공 시(`hasProfile === true`): 로그인 전 마지막 페이지가 기사님찾기(`/movers`)면 다시 기사님찾기로, 랜딩(`/`)이면 `/customer/my-quotes`로 — **아직 미구현**, `(auth)/customer/login/page.tsx`에 TODO 주석만 있음. 구현 시 `document.referrer`/`sessionStorage`(레이스 위험) 대신 로그인 링크에 `?redirect=` 쿼리파라미터 넘기는 방식 추천

## 공통 가드 규칙

- 비로그인 상태로 `(protected)/*` 접근 → 해당 role의 로그인 페이지로 (단, accessToken만 만료·refreshToken 생존 구간은 통과 — 위 fail-open 참고)
- role 불일치(예: customer 계정으로 `/mover/*` 접근) → `/`로
- 이미 로그인한 상태로 `(auth)/*` 접근 → `(auth)/layout.tsx`가 자기 role의 홈으로 즉시 리다이렉트
- `hasProfile === false` → mover는 `(with-profile)/layout.tsx`가 전체를 `/mover/profile-register`로 강제 이동, customer는 `my-quotes/[quoteId]`·`profile-edit`만 각 페이지의 `requireProfile()`이 `/customer/profile-register`로 이동(견적요청은 모달 유도, my-quotes 목록은 게이트 없이 빈 상태 CTA)
- 프로필 등록 페이지(`(protected)/{customer,mover}/profile-register/page.tsx`)는 반대로 이미 `hasProfile === true`면 각자 홈으로 되돌려보냄 (재등록 방지)

## 관련 파일

- `src/proxy.ts` — 쿠키 존재 여부 1차 필터 (BE 호출 없음)
- `src/lib/auth/find-my-account.ts` — `cache()`로 감싼 서버 전용 `/auth/me` 조회. `BACKEND_ORIGIN`은 `NEXT_PUBLIC_API_URL`(next.config.ts의 rewrites와 공유) 그대로 사용 — https 강제는 배포 시 환경변수를 https로 설정하는 것으로 처리(로컬 개발용 http://localhost 기본값과 별개 검증 로직 없음)
- `src/lib/auth/guards.ts` — `requireRole(role, loginPath)`, `requireProfile(account, redirectPath)`
- `src/app/(protected)/customer/quotation-requests/page.tsx` — 프로필 등록 유도 모달 TODO(미구현)
- `src/app/(auth)/layout.tsx`, `src/app/(auth)/{customer,mover}/layout.tsx`(가드 없음, UI 자리)
- `src/app/(protected)/{customer,mover}/layout.tsx`, `src/app/(protected)/mover/(with-profile)/layout.tsx`
- `src/providers/AuthProvider.tsx` (`AccountResponse` — `hasProfile`, `role` 필드; GNB 등 화면 표시용, customer 견적요청 모달도 구현 시 이걸로 판단)
