const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * 날짜 표기에 쓰는 로케일.
 *
 * 호출부에서 `useLocale()` / `getLocale()` 로 받아 넘깁니다.
 * 기본값이 "ko"라, 아직 번역을 적용하지 않은 화면은 기존 동작 그대로입니다.
 */
export type DateLocale = "ko" | "en" | "zh";

/**
 * 서버가 UTC로 주는 시각을 KST로 옮깁니다.
 *
 * `toLocaleString("ko-KR")`은 브라우저 타임존을 따라가서, 해외 접속이면 날짜가
 * 하루씩 어긋납니다. BE 배치도 같은 이유로 KST를 명시해 처리합니다.
 * 옮긴 뒤에는 `getUTC*`로 읽어야 합니다.
 *
 * ⚠️ **언어가 바뀌어도 시간대는 KST 고정**입니다. 이사 날짜는 한국 기준이
 * 유일한 정답이라, 표기 언어만 바뀌어야 합니다.
 */
function toKst(iso: string) {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS);
}

/** 한국어 외 로케일의 요일 약칭 — KST 기준 요일을 넘겨 받습니다 */
function weekdayLabel(kst: Date, locale: DateLocale) {
  if (locale === "ko") return WEEKDAYS_KO[kst.getUTCDay()];
  // 이미 KST로 옮긴 값이라 UTC로 포맷해야 요일이 어긋나지 않습니다
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short" }).format(kst);
}

/**
 * "2024년 07월 01일 (월)" — 카드·요약의 이사일.
 *
 * ⚠️ 한국어는 **피그마 표기를 그대로** 지킵니다. `Intl`에 맡기면
 * "2024. 07. 01. (월)"로 나와 시안과 달라집니다.
 * 영어·중국어만 각 로케일 관례를 따릅니다.
 */
export function formatMovingDate(iso: string, locale: DateLocale = "ko") {
  const kst = toKst(iso);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");
  const weekday = weekdayLabel(kst, locale);

  if (locale === "ko") return `${yyyy}년 ${mm}월 ${dd}일 (${weekday})`;
  if (locale === "zh") return `${yyyy}年 ${mm}月 ${dd}日 (${weekday})`;
  return `${mm}/${dd}/${yyyy} (${weekday})`;
}

/** "24.08.26" — 견적 상세의 "견적 요청일" (피그마 `1:9354`). 숫자 표기라 로케일 무관 */
export function formatRequestDate(iso: string) {
  const kst = toKst(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${String(kst.getUTCFullYear()).slice(2)}.${pad(kst.getUTCMonth() + 1)}.${pad(kst.getUTCDate())}`;
}

/**
 * "2024. 08. 26(월)" — 견적 상세의 "이용일" (피그마 `1:9360`).
 *
 * 카드의 `formatMovingDate`("2024년 07월 01일 (월)")와 같은 날짜인데 표기가 달라서
 * 따로 둡니다. 피그마에는 뒤에 시각까지 붙지만(`오전 10:00`) 견적 요청에 시각
 * 필드가 없어 날짜까지만 씁니다.
 */
export function formatUsageDate(iso: string, locale: DateLocale = "ko") {
  const kst = toKst(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = kst.getUTCFullYear();
  const mm = pad(kst.getUTCMonth() + 1);
  const dd = pad(kst.getUTCDate());
  const weekday = weekdayLabel(kst, locale);

  if (locale === "en") return `${mm}/${dd}/${yyyy}(${weekday})`;
  return `${yyyy}. ${mm}. ${dd}(${weekday})`;
}

/**
 * "방금 전" / "3분 전" / "1시간 전" / "2일 전" — 받은 요청 카드의 우측 상단.
 *
 * 7일이 넘으면 상대 표기가 오히려 가늠하기 어려워 날짜로 바꿉니다.
 *
 * ⚠️ 한국어는 직접 만듭니다. `Intl.RelativeTimeFormat`을 쓰면 "방금 전"이
 * "현재 분", "2일 전"이 "그저께"로 나와 시안과 달라집니다.
 * 영어·중국어는 `numeric: "always"`로 같은 형태("3 minutes ago")를 맞춥니다.
 */
export function formatElapsedTime(
  iso: string,
  locale: DateLocale = "ko",
  now: number = Date.now()
) {
  const diff = now - new Date(iso).getTime();

  if (locale === "ko") {
    // 서버·클라이언트 시계 차이로 미래가 나올 수 있어 음수를 방어합니다
    if (diff < MINUTE) return "방금 전";
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
    if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`;
    return formatMovingDate(iso, locale);
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
  // rtf.format(0, "minute")은 "in 0 minutes"(0분 후)로 나와 어색합니다
  if (diff < MINUTE) return locale === "zh" ? "刚刚" : "Just now";
  if (diff < HOUR) return rtf.format(-Math.floor(diff / MINUTE), "minute");
  if (diff < DAY) return rtf.format(-Math.floor(diff / HOUR), "hour");
  if (diff < 7 * DAY) return rtf.format(-Math.floor(diff / DAY), "day");

  return formatMovingDate(iso, locale);
}

/**
 * "1,200,000원" — 금액 표기.
 *
 * ⚠️ 한국어는 피그마 표기(`숫자 + 원`)를 지킵니다. `Intl`의 currency 스타일은
 * "₩1,200,000"으로 기호를 앞에 붙여 시안과 달라집니다.
 * 영어·중국어는 통화를 알 수 없으니 "KRW"를 덧붙입니다.
 */
export function formatPrice(amount: number, locale: DateLocale = "ko") {
  const number = new Intl.NumberFormat(locale).format(amount);

  if (locale === "ko") return `${number}원`;
  if (locale === "zh") return `${number} 韩元`;
  return `${number} KRW`;
}
