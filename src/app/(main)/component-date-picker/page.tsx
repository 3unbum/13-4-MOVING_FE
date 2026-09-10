"use client";

import { useState } from "react";
import DatePicker from "@/component/common/date-picker";

export default function DatePickerPage() {
  const [date, setDate] = useState<Date>();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          이사 예정일 선택 — 브라우저 폭을 tablet 브레이크포인트(744px) 이상으로 넓히면
          트리거+팝오버로, 그 미만이면 인라인 캘린더로 전환됨
        </h2>
        <DatePicker value={date} onChange={setDate} />
        <p className="text-14 text-gray-500">
          선택된 날짜: {date ? date.toLocaleDateString("ko-KR") : "없음"}
        </p>
      </section>
    </div>
  );
}
