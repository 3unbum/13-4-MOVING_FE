import { describe, expect, it } from "vitest";
import { REGION_LABELS, REGIONS, SERVICES } from "@/components/filter/ChipRegion";
import { toMoverListRegionParam, toMoverListServiceParam } from "./mover-filter-params";

/**
 * 필터 UI의 enum 코드(SEOUL) → `GET /movers`가 받는 한글 라벨(서울) 변환.
 *
 * 라벨이 어긋나면 BE가 조건을 못 알아들어 **필터가 조용히 전체 목록을 돌려줍니다.**
 * 에러가 나지 않아 눈치채기 어려운 종류라, 전수로 고정해 둡니다.
 */

describe("toMoverListRegionParam", () => {
  it("코드를 한글 라벨로 바꾼다", () => {
    expect(toMoverListRegionParam("SEOUL")).toBe("서울");
    expect(toMoverListRegionParam("GYEONGGI")).toBe("경기");
    expect(toMoverListRegionParam("JEJU")).toBe("제주");
  });

  // "전체"는 쿼리에서 빼야 BE 기본값(전체)과 맞습니다.
  // 빈 문자열을 보내면 BE가 "지역이 ''인 기사님"을 찾아 결과가 0건이 됩니다.
  it("ALL은 undefined — 쿼리에서 빠진다", () => {
    expect(toMoverListRegionParam("ALL")).toBeUndefined();
  });

  it("지역 17개 전부 라벨이 있다", () => {
    const missing = REGIONS.filter((code) => toMoverListRegionParam(code) === undefined);
    expect(missing).toEqual([]);
  });

  it("라벨 표와 결과가 일치한다", () => {
    for (const code of REGIONS) {
      expect(toMoverListRegionParam(code)).toBe(REGION_LABELS[code]);
    }
  });

  // 타입을 벗어난 값이 들어오면 undefined가 됩니다. 쿼리에서 빠지므로
  // 잘못된 조건으로 조회하는 것보다는 낫습니다.
  it("모르는 코드는 undefined", () => {
    expect(toMoverListRegionParam("MARS")).toBeUndefined();
    expect(toMoverListRegionParam("")).toBeUndefined();
  });
});

describe("toMoverListServiceParam", () => {
  it("코드를 한글 라벨로 바꾼다", () => {
    expect(toMoverListServiceParam("SMALL")).toBe("소형이사");
    expect(toMoverListServiceParam("HOME")).toBe("가정이사");
    expect(toMoverListServiceParam("OFFICE")).toBe("사무실이사");
  });

  it("ALL은 undefined", () => {
    expect(toMoverListServiceParam("ALL")).toBeUndefined();
  });

  it("서비스 3개 전부 라벨이 있다", () => {
    const missing = SERVICES.filter((code) => toMoverListServiceParam(code) === undefined);
    expect(missing).toEqual([]);
  });

  it("모르는 코드는 undefined", () => {
    expect(toMoverListServiceParam("SPACE")).toBeUndefined();
  });
});
