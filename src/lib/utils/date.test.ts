import { describe, expect, it } from "vitest";
import {
  formatDueDateTime,
  formatElapsedTime,
  formatMonthLabel,
  formatMovingDate,
  formatPrice,
  formatRequestDate,
  formatUsageDate,
  formatWrittenDate,
  recentMonths,
} from "./date";

/**
 * 날짜·금액 표기 테스트.
 *
 * 여기 적힌 기대값은 **피그마 시안을 그대로 옮긴 것**입니다. 여러 함수가 `Intl` 기본값을
 * 일부러 따르지 않는데(`date.ts` 주석 참고), 그 의도를 고정하는 것이 이 파일의 역할입니다.
 * 기대값을 고치기 전에 시안을 먼저 확인하세요.
 *
 * ⚠️ 시간대는 **KST 고정**입니다. 실행 환경의 타임존에 영향받지 않아야 하므로,
 *    기대값도 KST로 계산해 둡니다.
 */

/** KST 2024-07-01 09:00 (월요일) */
const MONDAY = "2024-07-01T00:00:00.000Z";

describe("formatMovingDate", () => {
  it("한국어는 피그마 표기를 따른다 — Intl 기본값(2024. 07. 01.)이 아니다", () => {
    expect(formatMovingDate(MONDAY, "ko")).toBe("2024년 07월 01일 (월)");
  });

  it("로케일별 표기", () => {
    expect(formatMovingDate(MONDAY, "en")).toBe("07/01/2024 (Mon)");
    expect(formatMovingDate(MONDAY, "zh")).toBe("2024年 07月 01日 (周一)");
    expect(formatMovingDate(MONDAY, "ja")).toBe("2024年 07月 01日 (月)");
  });

  it("폭이 좁은 카드에서는 요일을 뺀다", () => {
    expect(formatMovingDate(MONDAY, "ko", false)).toBe("2024년 07월 01일");
  });

  it("로케일을 생략하면 한국어", () => {
    expect(formatMovingDate(MONDAY)).toBe(formatMovingDate(MONDAY, "ko"));
  });

  // UTC 기준으로는 6월 30일이지만 KST로는 7월 1일입니다. 이 경계가 어긋나면
  // 해외 접속 시 이사일이 하루씩 밀립니다.
  it("KST 기준으로 날짜가 넘어간다", () => {
    expect(formatMovingDate("2024-06-30T15:00:00.000Z", "ko", false)).toBe("2024년 07월 01일");
    expect(formatMovingDate("2024-06-30T14:59:59.000Z", "ko", false)).toBe("2024년 06월 30일");
  });
});

describe("formatWrittenDate / formatRequestDate", () => {
  it("리뷰 작성일은 네 자리 연도에 점 뒤 공백", () => {
    expect(formatWrittenDate(MONDAY)).toBe("2024. 07. 01");
  });

  it("견적 요청일은 두 자리 연도에 공백 없음", () => {
    expect(formatRequestDate(MONDAY)).toBe("24.07.01");
  });

  it("둘 다 KST 기준", () => {
    expect(formatWrittenDate("2024-06-30T15:00:00.000Z")).toBe("2024. 07. 01");
    expect(formatRequestDate("2024-06-30T15:00:00.000Z")).toBe("24.07.01");
  });
});

describe("formatUsageDate", () => {
  it("영어만 MM/DD/YYYY, 나머지는 YYYY. MM. DD", () => {
    expect(formatUsageDate(MONDAY, "ko")).toBe("2024. 07. 01(월)");
    expect(formatUsageDate(MONDAY, "en")).toBe("07/01/2024(Mon)");
    expect(formatUsageDate(MONDAY, "zh")).toBe("2024. 07. 01(周一)");
    expect(formatUsageDate(MONDAY, "ja")).toBe("2024. 07. 01(月)");
  });

  // 같은 날짜인데 카드(formatMovingDate)와 표기가 다릅니다. 피그마가 그렇게 돼 있어
  // 함수를 나눠 둔 것이라, 둘이 같아지면 어느 한쪽이 시안과 어긋난 것입니다.
  it("카드 표기(formatMovingDate)와 다르다", () => {
    expect(formatUsageDate(MONDAY, "ko")).not.toBe(formatMovingDate(MONDAY, "ko"));
  });
});

describe("formatElapsedTime", () => {
  const now = new Date("2024-07-01T12:00:00.000Z").getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it("1분 미만은 '방금 전' — Intl의 '현재 분'이 아니다", () => {
    expect(formatElapsedTime(ago(30 * 1000), "ko", now)).toBe("방금 전");
    expect(formatElapsedTime(ago(30 * 1000), "en", now)).toBe("Just now");
    expect(formatElapsedTime(ago(30 * 1000), "zh", now)).toBe("刚刚");
    expect(formatElapsedTime(ago(30 * 1000), "ja", now)).toBe("たった今");
  });

  it("분·시간·일 단위", () => {
    expect(formatElapsedTime(ago(5 * MINUTE), "ko", now)).toBe("5분 전");
    expect(formatElapsedTime(ago(3 * HOUR), "ko", now)).toBe("3시간 전");
    expect(formatElapsedTime(ago(2 * DAY), "ko", now)).toBe("2일 전");
  });

  it("한국어 '2일 전'은 Intl의 '그저께'가 아니다", () => {
    expect(formatElapsedTime(ago(2 * DAY), "ko", now)).toBe("2일 전");
  });

  it("일본어는 Intl이 넣는 공백을 지운다", () => {
    expect(formatElapsedTime(ago(5 * MINUTE), "ja", now)).toBe("5分前");
    expect(formatElapsedTime(ago(3 * HOUR), "ja", now)).toBe("3時間前");
  });

  it("영어·중국어는 상대 표기", () => {
    expect(formatElapsedTime(ago(5 * MINUTE), "en", now)).toBe("5 minutes ago");
    expect(formatElapsedTime(ago(2 * DAY), "zh", now)).toBe("2天前");
  });

  // 7일이 넘으면 "9일 전"보다 날짜가 가늠하기 쉽습니다.
  it("7일을 넘으면 날짜 표기로 바꾼다", () => {
    expect(formatElapsedTime(ago(10 * DAY), "ko", now)).toBe("2024년 06월 21일 (금)");
    expect(formatElapsedTime(ago(10 * DAY), "en", now)).toBe("06/21/2024 (Fri)");
  });

  it("경계 — 7일 직전은 상대 표기", () => {
    expect(formatElapsedTime(ago(7 * DAY - 1000), "ko", now)).toBe("6일 전");
  });

  // 서버·클라이언트 시계가 어긋나면 미래 시각이 올 수 있습니다.
  // "-1분 전" 같은 표기가 뜨지 않아야 합니다.
  it("미래 시각은 '방금 전'으로 처리한다", () => {
    expect(formatElapsedTime(new Date(now + 5 * MINUTE).toISOString(), "ko", now)).toBe("방금 전");
  });
});

describe("formatPrice", () => {
  it("한국어는 '숫자 + 원' — Intl currency(₩1,200,000)가 아니다", () => {
    expect(formatPrice(1_200_000, "ko")).toBe("1,200,000원");
  });

  it("로케일별 통화 표기", () => {
    expect(formatPrice(1_200_000, "en")).toBe("1,200,000 KRW");
    expect(formatPrice(1_200_000, "zh")).toBe("1,200,000 韩元");
    expect(formatPrice(1_200_000, "ja")).toBe("1,200,000 ウォン");
  });

  it("0과 음수", () => {
    expect(formatPrice(0, "ko")).toBe("0원");
    expect(formatPrice(-5000, "ko")).toBe("-5,000원");
  });

  it("천 단위 구분자가 없는 작은 금액", () => {
    expect(formatPrice(999, "ko")).toBe("999원");
  });
});

describe("formatDueDateTime", () => {
  // 결제 기한처럼 시각까지 필요한 자리. KST 고정이라 실행 환경 타임존과 무관합니다.
  it("KST 기준 24시간제로 표기한다", () => {
    const iso = "2024-10-09T05:30:00.000Z"; // KST 14:30
    expect(formatDueDateTime(iso, "ko")).toBe("10. 9. 14:30");
    expect(formatDueDateTime(iso, "en")).toBe("10/9, 14:30");
  });
});

describe("recentMonths", () => {
  it("이번 달부터 거꾸로 세어 최신이 먼저", () => {
    expect(recentMonths(3, new Date("2026-01-15T00:00:00.000Z"))).toEqual([
      "2026-01",
      "2025-12",
      "2025-11",
    ]);
  });

  it("연도를 넘어가도 이어진다", () => {
    expect(recentMonths(2, new Date("2026-01-01T00:00:00.000Z"))).toEqual(["2026-01", "2025-12"]);
  });

  it("0개를 요청하면 빈 배열", () => {
    expect(recentMonths(0, new Date("2026-01-15T00:00:00.000Z"))).toEqual([]);
  });

  // KST로는 이미 다음 달 1일입니다. UTC로 세면 한 달이 밀립니다.
  it("KST 기준으로 '이번 달'을 정한다", () => {
    expect(recentMonths(1, new Date("2026-01-31T15:00:00.000Z"))).toEqual(["2026-02"]);
  });
});

describe("formatMonthLabel", () => {
  it("로케일별 연·월 표기", () => {
    expect(formatMonthLabel("2026-10", "ko")).toBe("2026년 10월");
    expect(formatMonthLabel("2026-10", "en")).toBe("October 2026");
    expect(formatMonthLabel("2026-10", "zh")).toBe("2026年10月");
    expect(formatMonthLabel("2026-10", "ja")).toBe("2026年10月");
  });

  it("한 자리 월도 올바르게 읽는다", () => {
    expect(formatMonthLabel("2026-01", "ko")).toBe("2026년 1월");
  });
});
