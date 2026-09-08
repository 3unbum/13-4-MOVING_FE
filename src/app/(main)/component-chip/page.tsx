"use client";

import AddressChip from "@/component/common/chip-address";
import Chip, {
  REGION_LABELS,
  REGIONS,
  SERVICE_LABELS,
  SERVICES,
} from "@/component/common/chip-region";
import MoveTypeChip from "@/component/common/chip-move-type";
import { Fragment, useState } from "react";

// GET /estimate/mover-requests 응답 예시 (mover가 받은 요청 목록) — category는 raw enum(SMALL/HOME/OFFICE) 그대로 내려옴
// isTargeted는 실제 응답 필드가 아니라 지정 요청 탭(쿼리파라미터)에서 온 건지로 FE가 판단하는 값 — 데모용으로 같이 표기
const MOCK_REQUESTS = [
  {
    id: 101,
    category: "SMALL",
    movingDate: "2026-09-20",
    quotationStatus: "PENDING",
    isTargeted: false,
  },
  {
    id: 102,
    category: "HOME",
    movingDate: "2026-09-22",
    quotationStatus: "PENDING",
    isTargeted: false,
  },
  {
    id: 103,
    category: "OFFICE",
    movingDate: "2026-09-25",
    quotationStatus: "PENDING",
    isTargeted: false,
  },
  {
    id: 104,
    category: "SMALL",
    movingDate: "2026-09-28",
    quotationStatus: "PENDING",
    isTargeted: true,
  },
] as const;

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
            {REGION_LABELS[region]}
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
            {REGION_LABELS[region]}
          </Chip>
        ))}
      </section>
      <h3 className="mt-6 font-semibold">이용 서비스- md</h3>
      <p className="text-16 text-gray-gray-400 mt-1">
        *이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
      </p>
      <section className="mt-6 flex flex-wrap gap-x-3.5 gap-y-4.5">
        {SERVICES.map((m_t) => (
          <Chip
            key={m_t}
            size="md"
            className="flex h-11.5 w-25.75 items-center justify-center"
            selected={myRegions.includes(m_t)}
            onClick={() => toggleRegion(m_t)}
          >
            {SERVICE_LABELS[m_t]}
          </Chip>
        ))}
      </section>
      <h4 className="mt-6 font-semibold">이용 서비스- sm</h4>
      <p className="text-16 text-gray-gray-400 mt-1">
        *이용 서비스는 중복 선택 가능하며, 언제든 수정 가능해요!
      </p>
      <section className="mt-6 flex flex-wrap gap-x-3.5 gap-y-4.5">
        {SERVICES.map((m_t) => (
          <Chip
            key={m_t}
            size="sm"
            className="flex h-9 w-21.25 items-center justify-center"
            selected={myRegions.includes(m_t)}
            onClick={() => toggleRegion(m_t)}
          >
            {SERVICE_LABELS[m_t]}
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
      <h4 className="mt-6 font-semibold">이사유형 chip (mock 응답 기반)</h4>
      <section className="mt-3 flex flex-wrap gap-2.5">
        {MOCK_REQUESTS.map((request) => (
          <Fragment key={request.id}>
            <MoveTypeChip variant={request.isTargeted ? "TARGETED" : request.category} size="md" />
            <MoveTypeChip variant={request.isTargeted ? "TARGETED" : request.category} size="sm" />
          </Fragment>
        ))}
      </section>
    </div>
  );
}
