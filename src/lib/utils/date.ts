const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * 서버가 UTC로 주는 시각을 KST로 옮깁니다.
 *
 * `toLocaleString("ko-KR")`은 브라우저 타임존을 따라가서, 해외 접속이면 날짜가
 * 하루씩 어긋납니다. BE 배치도 같은 이유로 KST를 명시해 처리합니다.
 * 옮긴 뒤에는 `getUTC*`로 읽어야 합니다.
 */
function toKst(iso: string) {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS);
}

/** "2024년 07월 01일 (월)" — 카드·요약의 이사일 */
export function formatMovingDate(iso: string) {
  const kst = toKst(iso);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kst.getUTCDate()).padStart(2, "0");

  return `${kst.getUTCFullYear()}년 ${mm}월 ${dd}일 (${WEEKDAYS[kst.getUTCDay()]})`;
}

/** "24.08.26" — 견적 상세의 "견적 요청일" (피그마 `1:9354`) */
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
export function formatUsageDate(iso: string) {
  const kst = toKst(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${kst.getUTCFullYear()}. ${pad(kst.getUTCMonth() + 1)}. ${pad(kst.getUTCDate())}(${WEEKDAYS[kst.getUTCDay()]})`;
}

/**
 * "방금 전" / "3분 전" / "1시간 전" / "2일 전" — 받은 요청 카드의 우측 상단.
 *
 * 7일이 넘으면 상대 표기가 오히려 가늠하기 어려워 날짜로 바꿉니다.
 */
export function formatElapsedTime(iso: string, now: number = Date.now()) {
  const diff = now - new Date(iso).getTime();

  // 서버·클라이언트 시계 차이로 미래가 나올 수 있어 음수를 방어합니다
  if (diff < MINUTE) return "방금 전";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`;

  return formatMovingDate(iso);
}
