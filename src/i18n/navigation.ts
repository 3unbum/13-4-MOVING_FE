import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * locale을 유지하는 네비게이션 래퍼.
 *
 * `next/link`·`next/navigation` 을 그대로 쓰면 이동할 때 locale이 빠져
 * 리다이렉트가 계속 발생합니다. 이 파일에서 가져다 쓰세요.
 *
 * ```ts
 * // ❌ import Link from "next/link";
 * // ✅
 * import { Link, useRouter } from "@/i18n/navigation";
 * ```
 *
 * 서버 액션 안의 `redirect` 도 교체 대상입니다.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
