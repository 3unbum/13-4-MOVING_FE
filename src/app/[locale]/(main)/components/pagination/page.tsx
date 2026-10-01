"use client";

import { useState } from "react";
import Pagination from "@/components/common/Pagination";

export default function PaginationPage() {
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(5);
  const [page3, setPage3] = useState(1);
  const [page4, setPage4] = useState(5);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          기본 (5페이지, 생략 없음) — 브라우저 폭을 pc 브레이크포인트 이상으로 넓히면 자동으로 lg로
          전환됨
        </h2>
        <Pagination currentPage={page1} totalPages={5} onPageChange={setPage1} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          많은 페이지 (20페이지, 현재 페이지 기준 앞뒤 생략 표시)
        </h2>
        <Pagination currentPage={page2} totalPages={20} onPageChange={setPage2} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          페이지가 1개뿐인 경우 (컴포넌트가 아무것도 렌더링하지 않음)
        </h2>
        <Pagination currentPage={page3} totalPages={1} onPageChange={setPage3} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-semibold text-gray-500">
          size=&quot;sm&quot; 강제 고정 (화면 폭과 무관하게 항상 sm으로 보고 싶을 때만 사용)
        </h2>
        <Pagination currentPage={page4} totalPages={20} onPageChange={setPage4} size="sm" />
      </section>
    </div>
  );
}
