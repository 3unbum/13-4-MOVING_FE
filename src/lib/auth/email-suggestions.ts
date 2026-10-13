import { EMAIL_DOMAINS } from "@/constants/auth/email-domains";

/**
 * 입력 중인 이메일에 붙일 도메인 추천 목록(완성된 이메일 형태)을 반환한다.
 *
 * `@` 앞에 아이디가 있을 때만 추천하고, `@` 뒤 글자로 시작하는 도메인만 남긴다(대소문자 무시).
 * 이미 목록의 도메인과 정확히 같으면 빈 배열 — 항목을 고르면 값이 이렇게 되므로 목록이 저절로 닫힌다.
 */
export function findEmailSuggestions(value: string): string[] {
  const atIndex = value.indexOf("@");
  if (atIndex <= 0) return [];

  const localPart = value.slice(0, atIndex);
  const typedDomain = value.slice(atIndex + 1).toLowerCase();
  // `@`가 두 번 이상이면 이메일 형식이 아니라 추천하지 않는다
  if (typedDomain.includes("@") || EMAIL_DOMAINS.includes(typedDomain)) return [];

  return EMAIL_DOMAINS.filter((domain) => domain.startsWith(typedDomain)).map(
    (domain) => `${localPart}@${domain}`
  );
}
