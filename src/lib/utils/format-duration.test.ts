import { describe, expect, it } from "vitest";
import { formatCountdown } from "./format-duration";

describe("formatCountdown", () => {
  it("분과 초를 두 자리로 채운다", () => {
    expect(formatCountdown(65)).toBe("01:05");
    expect(formatCountdown(5)).toBe("00:05");
    expect(formatCountdown(600)).toBe("10:00");
  });

  it("0초는 00:00", () => {
    expect(formatCountdown(0)).toBe("00:00");
  });

  // 남은 시간을 1초마다 줄이다 보면 음수로 내려가는 순간이 있습니다.
  // "-1:-1" 같은 표기가 화면에 뜨지 않도록 0으로 눌러 둡니다.
  it("음수는 00:00 으로 눌러 준다", () => {
    expect(formatCountdown(-1)).toBe("00:00");
    expect(formatCountdown(-100)).toBe("00:00");
  });

  it("60분을 넘겨도 분으로만 표기한다", () => {
    expect(formatCountdown(3600)).toBe("60:00");
    expect(formatCountdown(3661)).toBe("61:01");
  });
});
