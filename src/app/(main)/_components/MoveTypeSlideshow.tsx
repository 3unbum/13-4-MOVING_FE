"use client";

import { animate, useMotionValue } from "motion/react";
import { useEffect } from "react";
import type { SelectCardVariant } from "@/components/common/SelectCard";
import MoveTypeSlideCard from "./MoveTypeSlideCard";

const VARIANTS: SelectCardVariant[] = ["SMALL", "HOME", "OFFICE"];
const ROTATION_DURATION_S = 15;

// 회전문처럼 타원 궤도를 계속 도는 3D 캐러셀 — discrete하게 순서를 바꾸는 셔플이 아니라,
// 공유 각도값(angle) 하나를 무한 반복(linear)으로 계속 돌리고 카드마다 120도씩 위상차를 둬서
// 위치·크기·투명도를 그 각도에서 파생시킨다.
export default function MoveTypeSlideshow() {
  const angle = useMotionValue(0);

  useEffect(() => {
    const controls = animate(angle, 360, {
      duration: ROTATION_DURATION_S,
      repeat: Infinity,
      ease: "linear",
    });
    return () => controls.stop();
  }, [angle]);

  return (
    <div className="pc:flex-1 relative h-56 px-4 pt-4" style={{ perspective: 800 }}>
      {VARIANTS.map((variant, index) => (
        <MoveTypeSlideCard key={variant} variant={variant} angle={angle} offsetDeg={index * 120} />
      ))}
    </div>
  );
}
