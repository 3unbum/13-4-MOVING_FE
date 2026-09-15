"use client";

import {
  SELECT_CARD_IMAGES,
  SELECT_CARD_LABELS,
  SELECT_CARD_SUBTITLES,
  type SelectCardVariant,
} from "@/components/common/SelectCard";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { motion, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";

// depthNorm(0~1)을 모바일 고정값 또는 태블릿/PC side→center 보간값으로 바꿔주는 훅
function useLerp(
  depthNorm: MotionValue<number>,
  isTabletUp: boolean,
  mobile: number,
  side: number,
  center: number
) {
  return useTransform(depthNorm, (t) => (isTabletUp ? side + (center - side) * t : mobile));
}

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
const MAX_TILT_DEG = 28;

const MOBILE_WIDTH = 128; // w-32
const MOBILE_IMAGE_SIZE = 64; // size-16
const MOBILE_LABEL_FONT = 14;
const MOBILE_SUBTITLE_FONT = 12;

const SIDE_SIZE = { width: 200, height: 203, image: 120, labelFont: 16, subtitleFont: 13 };
const CENTER_SIZE = { width: 245, height: 261, image: 160, labelFont: 20, subtitleFont: 15 };

// 공유 angle에 카드별 위상차(offsetDeg)를 더해서 타원 궤도 위 내 위치를 계산한다.
// depth(-1 뒤 ~ 1 앞)로 위치·투명도·앞뒤 쌓임 순서·기울기(rotateY)를 파생시켜 입체감을 낸다.
// 크기는 모바일=scale(내용물까지 통째로 같이 커짐), 태블릿/PC=박스와 내용물(이미지/폰트) 각각 지정된 px로 보간.
export default function MoveTypeSlideCard({ variant, angle, offsetDeg }: MoveTypeSlideCardProps) {
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const isPcUp = useMediaQuery(PC_QUERY);

  const rad = useTransform(angle, (a) => (((a + offsetDeg) % 360) * Math.PI) / 180);
  const sinValue = useTransform(rad, (r) => Math.sin(r));
  const depth = useTransform(rad, (r) => Math.cos(r)); // -1(뒤) ~ 1(앞)
  const depthNorm = useTransform(depth, (d) => (d + 1) / 2); // 0(뒤) ~ 1(앞)

  const radiusX = isPcUp ? PC_RADIUS_X : isTabletUp ? TABLET_RADIUS_X : MOBILE_RADIUS_X;
  const x = useTransform(sinValue, (s) => s * radiusX);
  const y = useTransform(depth, (d) => (1 - d) * RADIUS_Y);
  const scale = useTransform(depthNorm, (t) => 0.65 + 0.45 * t);
  const width = useLerp(depthNorm, isTabletUp, MOBILE_WIDTH, SIDE_SIZE.width, CENTER_SIZE.width);
  const height = useLerp(depthNorm, isTabletUp, 0, SIDE_SIZE.height, CENTER_SIZE.height);
  const imageSize = useLerp(
    depthNorm,
    isTabletUp,
    MOBILE_IMAGE_SIZE,
    SIDE_SIZE.image,
    CENTER_SIZE.image
  );
  const labelFontSize = useLerp(
    depthNorm,
    isTabletUp,
    MOBILE_LABEL_FONT,
    SIDE_SIZE.labelFont,
    CENTER_SIZE.labelFont
  );
  const subtitleFontSize = useLerp(
    depthNorm,
    isTabletUp,
    MOBILE_SUBTITLE_FONT,
    SIDE_SIZE.subtitleFont,
    CENTER_SIZE.subtitleFont
  );
  const marginLeft = useTransform(width, (w) => -(isTabletUp ? w : MOBILE_WIDTH) / 2);
  const opacity = useTransform(depthNorm, (t) => 0.5 + 0.5 * t);
  const zIndex = useTransform(depth, (d) => Math.round(d * 10));
  const rotateY = useTransform(sinValue, (s) => -s * MAX_TILT_DEG);
  const borderColor = useTransform(depth, [-1, 0.6, 1], ["#f7f7f700", "#f7f7f700", "#f9502e"]);
  const backgroundColor = useTransform(depth, [-1, 0.6, 1], ["#f7f7f7", "#f7f7f7", "#feeeea"]);
  const labelColor = useTransform(depth, [-1, 0.6, 1], ["#1a1a1a", "#1a1a1a", "#f9502e"]);

  return (
    <motion.div
      className="absolute top-0 left-1/2 flex w-32 flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center"
      style={{
        x,
        y,
        marginLeft,
        opacity,
        zIndex,
        rotateY,
        borderColor,
        backgroundColor,
        ...(isTabletUp ? { width, height } : { scale }),
      }}
    >
      <motion.div className="relative shrink-0" style={{ width: imageSize, height: imageSize }}>
        <Image src={SELECT_CARD_IMAGES[variant]} alt="" fill className="object-contain" />
      </motion.div>
      <motion.span style={{ color: labelColor, fontSize: labelFontSize }} className="font-bold">
        {SELECT_CARD_LABELS[variant]}
      </motion.span>
      <motion.span
        style={{ fontSize: subtitleFontSize }}
        className="text-gray-gray-500 whitespace-nowrap"
      >
        {SELECT_CARD_SUBTITLES[variant]}
      </motion.span>
    </motion.div>
  );
}
