"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { SelectCardVariant } from "@/components/common/SelectCard";
import MoveTypeSlideCard from "./MoveTypeSlideCard";

const VARIANTS: SelectCardVariant[] = ["SMALL", "HOME", "OFFICE"];
const ROTATION_DURATION_S = 15;

// 회전문처럼 타원 궤도를 계속 도는 3D 캐러셀 — discrete하게 순서를 바꾸는 셔플이 아니라,
// 공유 각도값(angle) 하나를 무한 반복(linear)으로 계속 돌리고 카드마다 120도씩 위상차를 둬서
// 위치·크기·투명도를 그 각도에서 파생시킨다.
export default function MoveTypeSlideshow() {
  const ref = useRef<HTMLDivElement>(null);
  const angle = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  // 화면 밖에서는 멈춘다 — 랜딩의 스크롤 연동 애니메이션과 메인 스레드를 나눠 쓰면 프레임이 끊긴다
  const isInView = useInView(ref, { margin: "100px 0px" });

  useEffect(() => {
    if (prefersReducedMotion || !isInView) return;
    // 멈췄던 자리에서 이어 돈다. 처음부터 다시 돌리면 카드가 튀고, 남은 각도를 전체 시간으로 돌리면 느려진다.
    const from = angle.get() % 360;
    angle.set(from);
    const controls = animate(angle, from + 360, {
      duration: ROTATION_DURATION_S,
      repeat: Infinity,
      ease: "linear",
    });
    return () => controls.stop();
  }, [angle, prefersReducedMotion, isInView]);

  return (
    <div
      ref={ref}
      className="pc:flex-1 tablet:h-[269.5px] relative h-56 overflow-x-clip px-4 pt-4"
      style={{ perspective: 800 }}
    >
      {VARIANTS.map((variant, index) => (
        <MoveTypeSlideCard key={variant} variant={variant} angle={angle} offsetDeg={index * 120} />
      ))}
    </div>
  );
}
