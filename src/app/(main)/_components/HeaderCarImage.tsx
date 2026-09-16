"use client";

import car from "@/assets/images/landing/car.md.png";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";

const HEADER_HEIGHT_PX = 313; // header의 h-78.25(78.25 * 4px)와 맞춤
const EXIT_X = -450; // 이 정도 스크롤되면 뷰포트 왼쪽 밖으로 완전히 나감

// 스크롤해서 header가 화면 위로 빠져나가는 만큼 car 이미지가 왼쪽으로 이동한다.
export default function HeaderCarImage() {
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, [0, HEADER_HEIGHT_PX], [0, EXIT_X]);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div style={{ x: prefersReducedMotion ? 0 : x }}>
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
