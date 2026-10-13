"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

type RevealTag = "div" | "h2" | "span";

interface RevealProps {
  children: ReactNode;
  className?: string;
  tag?: RevealTag;
  /** 시작 위치에서 제자리까지 올라오는 거리(px) */
  y?: number;
  /** 시작 흐림(px). 0이면 흐림 없음 */
  blur?: number;
  /** 시작 배율. 1이면 확대 없음 */
  scale?: number;
  delay?: number;
}

/**
 * 화면에 들어오면 한 번만 아래에서 올라오며 나타납니다.
 * 모션 줄이기 설정이면 애니메이션 없이 그대로 보여줍니다.
 *
 * 사용법: <Reveal y={30} blur={8}>제목</Reveal>
 */
export function Reveal({
  children,
  className,
  tag = "div",
  y = 30,
  blur = 0,
  scale = 1,
  delay = 0,
}: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[tag];

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y, scale, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </Tag>
  );
}

/**
 * 화면을 지나가는 동안 스크롤에 맞춰 위아래로 천천히 움직입니다 (패럴랙스).
 * from → to 는 요소가 화면 아래에서 들어와 위로 나갈 때의 이동 거리(px)입니다.
 */
export function Parallax({
  children,
  className,
  from = 40,
  to = -40,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [from, to]);

  return (
    <motion.div ref={ref} className={className} style={{ y: reduce ? 0 : y }}>
      {children}
    </motion.div>
  );
}

/**
 * 글자 뒤로 주황 형광펜이 왼쪽에서 오른쪽으로 그어집니다. 화면에 들어오면 한 번만 실행됩니다.
 * 글자 길이에 맞춰 늘어나서 번역이 바뀌어도 그대로 동작합니다.
 */
export function Highlight({ children, delay = 0.6 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      className="relative inline-block"
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0.5 h-[40%] origin-left rounded-sm bg-orange-400/25"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1 } }}
        transition={{ duration: 0.7, delay, ease: "easeOut" }}
      />
      <span className="relative">{children}</span>
    </motion.span>
  );
}

/**
 * 뒤로 눕혀진 3D 상태로 있다가 스크롤하면서 똑바로 섭니다 ("컨테이너 스크롤" 효과).
 * 안에 든 이미지와 그 위에 올린 요소가 한 덩어리로 같이 기울어지므로 어긋나 보이지 않습니다.
 */
export function TiltOnScroll({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 35%"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        reduce
          ? undefined
          : { rotateX, scale, transformPerspective: 1200, transformOrigin: "50% 85%" }
      }
    >
      {children}
    </motion.div>
  );
}
