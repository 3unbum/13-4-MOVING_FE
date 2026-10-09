"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * 화면에 들어오면 0에서 target까지 올라가는 숫자를 돌려줍니다 (한 번만).
 * 모션 줄이기 설정이면 처음부터 target을 보여줍니다.
 *
 * 사용법: const { ref, value } = useCountUp(180000, { delay: 0.4 }); → <span ref={ref}>{value}</span>
 */
export function useCountUp<T extends HTMLElement = HTMLDivElement>(
  target: number,
  {
    delay = 0,
    duration = 1.2,
    step = 1000,
  }: { delay?: number; duration?: number; step?: number } = {}
) {
  const reduce = useReducedMotion();
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, target, {
      duration,
      delay,
      ease: "easeOut",
      // 단위 단위로 올라가야 숫자가 덜 어지럽습니다
      onUpdate: (v) => setValue(Math.round(v / step) * step),
    });
    return () => controls.stop();
  }, [inView, reduce, target, delay, duration, step]);

  return { ref, value };
}
