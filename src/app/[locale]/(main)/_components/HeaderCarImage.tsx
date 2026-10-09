"use client";

import car from "@/assets/images/landing/car.md.png";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// 첫 화면이 고정된 동안 스크롤하면 트럭이 가운데에서 화면 왼쪽 끝까지 이동한다.
// 이동 거리 = (화면 너비 - 트럭 너비) / 2. page.tsx의 spacer 높이(50vw - 트럭너비/2)와 같아야 한다.
export default function HeaderCarImage() {
  const { scrollY } = useScroll();
  const ref = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const update = () => {
      const width = ref.current?.offsetWidth ?? 0;
      setDistance(Math.max(0, (window.innerWidth - width) / 2));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const x = useTransform(scrollY, (y) => -Math.min(y, distance));

  return (
    <motion.div ref={ref} style={{ x: prefersReducedMotion ? 0 : x }}>
      <Image
        src={car}
        alt="car"
        width={160}
        height={100}
        className="tablet:w-40 tablet:h-25 h-15.5 w-25"
      />
    </motion.div>
  );
}
