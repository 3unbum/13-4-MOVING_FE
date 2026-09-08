"use client";

import AddressChip from "@/component/common/chip-address";
import Chip from "@/component/common/chip-region";
import MoveTypeChip from "@/component/common/chip-move-type";
import { useState } from "react";

const REGIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충북",
  "충남",
  "세종",
  "대전",
  "전북",
  "전남",
  "광주",
  "경북",
  "경남",
  "대구",
  "울산",
  "부산",
  "제주",
];
const MOVE_TYPE = ["소형이사", "가정이사", "사무실이사"];
export default function Page() {
  const [myRegions, setMyRegions] = useState<string[]>([]);

  const toggleRegion = (region: string) => {
    setMyRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  return (
    <div className="px-10">
      <h1 className="mt-6 font-semibold">내가 사는 지역 - md</h1>
      <p className="text-16 text-gray-gray-400 mt-1">*내가 사는 지역은 언제든 수정 가능해요!</p>
      <section className="mt-6 flex flex-wrap gap-x-3.5 gap-y-4.5">
        {REGIONS.map((region) => (
          <Chip
            key={region}
            size="md"
            className="flex h-11.5 w-18 items-center justify-center"
            selected={myRegions.includes(region)}
            onClick={() => toggleRegion(region)}
          >
            {region}
          </Chip>
        ))}
      </section>
      <h2 className="mt-6 font-semibold">내가 사는 지역 - sm</h2>
      <p className="text-12 text-gray-gray-400 mt-2">*내가 사는 지역은 언제든 수정 가능해요!</p>
      <section className="mt-6 flex flex-wrap gap-x-2 gap-y-3">
        {REGIONS.map((region) => (
          <Chip
            key={region}
            size="sm"
            className="flex h-9 w-12.25 items-center justify-center"
            selected={myRegions.includes(region)}
            onClick={() => toggleRegion(region)}
          >
            {region}
          </Chip>
        ))}
      </section>
      <h3 className="mt-6 font-semibold">이용 서비스- md</h3>
      <p className="text-16 text-gray-gray-400 mt-1">
        *이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
      </p>
      <section className="mt-6 flex flex-wrap gap-x-3.5 gap-y-4.5">
        {MOVE_TYPE.map((m_t) => (
          <Chip
            key={m_t}
            size="md"
            className="flex h-11.5 w-25.75 items-center justify-center"
            selected={myRegions.includes(m_t)}
            onClick={() => toggleRegion(m_t)}
          >
            {m_t}
          </Chip>
        ))}
      </section>
      <h4 className="mt-6 font-semibold">이용 서비스- sm</h4>
      <p className="text-16 text-gray-gray-400 mt-1">
        *이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
      </p>
      <section className="mt-6 flex flex-wrap gap-x-3.5 gap-y-4.5">
        {MOVE_TYPE.map((m_t) => (
          <Chip
            key={m_t}
            size="sm"
            className="flex h-9 w-21.25 items-center justify-center"
            selected={myRegions.includes(m_t)}
            onClick={() => toggleRegion(m_t)}
          >
            {m_t}
          </Chip>
        ))}
      </section>
      <h3 className="mt-6 font-semibold">주소 chip</h3>
      <section className="mt-3 flex flex-wrap gap-2.5">
        <AddressChip size="md">도로명</AddressChip>
        <AddressChip size="sm">도로명</AddressChip>
        <AddressChip size="md">지번</AddressChip>
        <AddressChip size="sm">지번</AddressChip>
      </section>
      <h4 className="mt-6 font-semibold">이사유형 chip</h4>
      <section className="mt-3 flex flex-wrap gap-2.5">
        <MoveTypeChip variant="소형이사" size="md" />
        <MoveTypeChip variant="소형이사" size="sm" />
        <MoveTypeChip variant="가정이사" size="md" />
        <MoveTypeChip variant="가정이사" size="sm" />
        <MoveTypeChip variant="사무실이사" size="md" />
        <MoveTypeChip variant="사무실이사" size="sm" />
        <MoveTypeChip variant="지정견적요청" size="md" />
        <MoveTypeChip variant="지정견적요청" size="sm" />
      </section>
    </div>
  );
}
