"use client";

import { useInView, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/** 카드 등장·금액 카운트업이 끝난 뒤에 선택 연출을 시작합니다 */
const START_DELAY_MS = 2600;
const STEP_MS = 2800;

const QuoteSelectionContext = createContext(-1);

/** 지금 "선택된" 카드의 순서. 연출 전·화면 밖·모션 줄이기면 -1 */
export const useSelectedQuote = () => useContext(QuoteSelectionContext);

/**
 * 안쪽 카드들을 순서대로 하나씩 "선택"합니다 (선택된 카드는 떠오르고 나머지는 흐려집니다).
 * 화면에 보이는 동안만 돌고, 벗어나면 멈춥니다.
 *
 * 카드 좌표는 부모(스테이지) 기준이라 이 래퍼는 스테이지를 꽉 채웁니다.
 */
export default function QuoteSelection({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [selected, setSelected] = useState(-1);

  useEffect(() => {
    if (!inView || reduce) return;

    let step = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setSelected(0);
      interval = setInterval(() => {
        step += 1;
        setSelected(step % count);
      }, STEP_MS);
    }, START_DELAY_MS);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
      setSelected(-1);
    };
  }, [inView, reduce, count]);

  return (
    <QuoteSelectionContext.Provider value={selected}>
      <div ref={ref} className="absolute inset-0">
        {children}
      </div>
    </QuoteSelectionContext.Provider>
  );
}
