"use client";

import { SELECT_CARD_IMAGES, type SelectCardVariant } from "@/components/common/SelectCard";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations } from "next-intl";
import { motion, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";

// Math.sin/cos 결과의 마지막 자리가 서버(Node)와 브라우저에서 달라 SSR style 문자열이 어긋난다.
// 소수 6자리로 고정하면 두 환경이 같은 값을 내고, 이후 파생값(곱셈/덧셈)은 IEEE 연산이라 동일하다.
const round6 = (v: number) => Math.round(v * 1e6) / 1e6;

interface MoveTypeSlideCardProps {
  variant: SelectCardVariant;
  angle: MotionValue<number>;
  offsetDeg: number;
}

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

// 카드 중심 간 거리 = radiusX * sin(120deg), 갭 = 그 거리 - (가운데폭/2 + 옆폭/2). 스펙: pc gap-6(24px), tablet gap-4(16px)
const MOBILE_RADIUS_X = 150;
const TABLET_RADIUS_X = 275;
const PC_RADIUS_X = 285;
const RADIUS_Y = 14;
const MAX_TILT_DEG = 20;

const MOBILE_WIDTH = 128; // w-32
const MOBILE_IMAGE_SIZE = 64; // size-16
const MOBILE_LABEL_FONT = 14;
const MOBILE_SUBTITLE_FONT = 12;

// 태블릿/PC는 카드를 가운데 크기로 고정해 두고 깊이에 따라 scale만 바꾼다. width·fontSize 같은 레이아웃
// 속성을 매 프레임 바꾸면 설명 줄바꿈과 글자 위치가 계속 흔들려서, GPU가 처리하는 transform만 쓴다.
// 옆 카드 비율은 피그마 옆/가운데 크기(폭 200/245, 이미지 120/160, 폰트 16/20)의 평균쯤.
const CENTER_SIZE = { width: 245, height: 261, image: 160, labelFont: 20, subtitleFont: 15 };
const SIDE_SCALE = 0.8;

// 공유 angle에 카드별 위상차(offsetDeg)를 더해서 타원 궤도 위 내 위치를 계산한다.
// depth(-1 뒤 ~ 1 앞)로 위치·투명도·앞뒤 쌓임 순서·기울기(rotateY)·크기(scale)를 파생시켜 입체감을 낸다.
// 모바일은 scale 범위가 더 넓고(0.65~1.1) 내용물까지 통째로 같이 커진다.
export default function MoveTypeSlideCard({ variant, angle, offsetDeg }: MoveTypeSlideCardProps) {
  const t = useTranslations("service");
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const isPcUp = useMediaQuery(PC_QUERY);

  const rad = useTransform(angle, (a) => (((a + offsetDeg) % 360) * Math.PI) / 180);
  const sinValue = useTransform(rad, (r) => round6(Math.sin(r)));
  const depth = useTransform(rad, (r) => round6(Math.cos(r))); // -1(뒤) ~ 1(앞)
  const depthNorm = useTransform(depth, (d) => (d + 1) / 2); // 0(뒤) ~ 1(앞)

  const radiusX = isPcUp ? PC_RADIUS_X : isTabletUp ? TABLET_RADIUS_X : MOBILE_RADIUS_X;
  const x = useTransform(sinValue, (s) => s * radiusX);
  const y = useTransform(depth, (d) => (1 - d) * RADIUS_Y);
  const scale = useTransform(depthNorm, (t) =>
    isTabletUp ? SIDE_SCALE + (1 - SIDE_SCALE) * t : 0.65 + 0.45 * t
  );
  const opacity = useTransform(depthNorm, (t) => 0.5 + 0.5 * t);
  const zIndex = useTransform(depth, (d) => Math.round(d * 10));
  const rotateY = useTransform(sinValue, (s) => -s * MAX_TILT_DEG);
  const borderColor = useTransform(depth, [-1, 0.6, 1], ["#f7f7f700", "#f7f7f700", "#f9502e"]);
  const backgroundColor = useTransform(depth, [-1, 0.6, 1], ["#f7f7f7", "#f7f7f7", "#feeeea"]);
  const labelColor = useTransform(depth, [-1, 0.6, 1], ["#1a1a1a", "#1a1a1a", "#f9502e"]);

  const cardWidth = isTabletUp ? CENTER_SIZE.width : MOBILE_WIDTH;
  const imageSize = isTabletUp ? CENTER_SIZE.image : MOBILE_IMAGE_SIZE;

  return (
    <motion.div
      className="absolute top-0 left-1/2 flex w-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 text-center"
      style={{
        x,
        y,
        marginLeft: -cardWidth / 2,
        opacity,
        zIndex,
        rotateY,
        borderColor,
        backgroundColor,
        width: cardWidth,
        // 높이는 고정이 아니라 최소값입니다. 한국어·일본어·중국어 설명은 한 줄이라
        // 피그마 값(261px) 그대로지만, 영어 "Studio or 2-room, under 20 pyeong"은
        // 두 줄이 되어 고정 높이에서는 카드 밖으로 삐져나왔습니다.
        minHeight: isTabletUp ? CENTER_SIZE.height : undefined,
        height: "auto",
        scale,
        // 태블릿/PC는 옆 카드도 윗선을 맞춘다(가운데 크기 기준으로 줄어들 때 위로 붙는다)
        originY: isTabletUp ? 0 : 0.5,
        willChange: "transform, opacity",
        // 3D 회전 중 뒷면 판정으로 글자가 깜빡이는 걸 막는다
        backfaceVisibility: "hidden",
      }}
    >
      <div className="relative shrink-0" style={{ width: imageSize, height: imageSize }}>
        <Image src={SELECT_CARD_IMAGES[variant]} alt="" fill className="object-contain" />
      </div>
      <motion.span
        style={{
          color: labelColor,
          fontSize: isTabletUp ? CENTER_SIZE.labelFont : MOBILE_LABEL_FONT,
        }}
        className="font-bold"
      >
        {t(variant)}
      </motion.span>
      <span
        style={{ fontSize: isTabletUp ? CENTER_SIZE.subtitleFont : MOBILE_SUBTITLE_FONT }}
        // 영어 설명("Studio or 2-room, under 20 pyeong")은 모바일 카드 폭 128px을 넘어 줄바꿈이 필요합니다
        className="text-gray-gray-500 w-full text-center whitespace-normal"
      >
        {t(`desc${variant}`)}
      </span>
    </motion.div>
  );
}
