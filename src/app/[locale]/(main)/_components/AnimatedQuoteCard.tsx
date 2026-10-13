"use client";

import { CardPendingHistory } from "@/components/quote/CardEstimate";
import { useCountUp } from "@/hooks/useCountUp";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";
import { useSelectedQuote } from "./QuoteSelection";

type AnimatedQuoteCardProps = Omit<ComponentProps<typeof CardPendingHistory>, "price"> & {
  /** 카드가 나타나는 순서. 등장·둥실거림 박자가 이 값으로 어긋납니다 */
  index: number;
  price: number;
};

/**
 * 랜딩 소개용 견적 카드. 실제 CardPendingHistory를 그대로 쓰고 움직임만 얹습니다.
 *
 * - 바깥: 스프링으로 기울어져 날아와 자리 잡고, 마우스를 올리면 떠오릅니다
 * - 안쪽: 등장 뒤에도 카드마다 다른 박자로 천천히 위아래로 둥실거립니다
 *   (같은 요소에 두면 등장·호버의 y와 겹쳐서 서로 덮어씁니다)
 * - 가장 안쪽: QuoteSelection이 고른 카드는 떠올라 테두리가 켜지고 확정 버튼이 깜빡이며,
 *   나머지는 살짝 흐려집니다
 * - 금액은 화면에 들어오면 0원에서 올라갑니다
 *
 * 모션 줄이기 설정이면 전부 끄고 정지 상태로 보여줍니다.
 */
export default function AnimatedQuoteCard({ index, price, ...cardProps }: AnimatedQuoteCardProps) {
  const reduce = useReducedMotion();
  const { ref, value: shown } = useCountUp(price, { delay: 0.3 + index * 0.1 });
  const selectedIndex = useSelectedQuote();
  const isSelected = selectedIndex === index;
  const isDimmed = selectedIndex !== -1 && !isSelected;

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 80, rotate: index % 2 ? 3 : -3, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 90, damping: 14, delay: index * 0.1 }}
      whileHover={reduce ? undefined : { y: -10, scale: 1.02 }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{
          duration: 4 + index * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.3,
        }}
      >
        <motion.div
          className={
            isSelected ? "rounded-[20px] [&_button.bg-orange-400]:animate-pulse" : "rounded-[20px]"
          }
          animate={{
            y: isSelected ? -14 : 0,
            scale: isSelected ? 1.04 : isDimmed ? 0.97 : 1,
            opacity: isDimmed ? 0.55 : 1,
            boxShadow: isSelected
              ? "0 0 0 3px #f9502e, 0 18px 40px rgba(249,80,46,0.28)"
              : "0 0 0 0px rgba(249,80,46,0), 0 0px 0px rgba(249,80,46,0)",
          }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        >
          <CardPendingHistory {...cardProps} price={shown} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
