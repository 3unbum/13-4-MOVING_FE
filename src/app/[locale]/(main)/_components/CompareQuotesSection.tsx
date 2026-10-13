import { getTranslations } from "next-intl/server";
import Image from "next/image";
import building from "@/assets/images/landing/img4_building.svg";
import AnimatedQuoteCard from "./AnimatedQuoteCard";
import QuoteSelection from "./QuoteSelection";
import { Highlight, Parallax, Reveal } from "./Reveal";
import ScaledStage from "./ScaledStage";

// 피그마 랜딩 img4를 크기별(sm 375 / md 744 / lg 1920)로 그대로 옮긴 좌표입니다.
// 제목 maxWidth는 오른쪽 카드·화면 끝과 겹치지 않는 폭입니다 (번역이 길면 줄바꿈됩니다).
// 카드는 실제 컴포넌트(lg, 폭 600)를 cardScale 만큼 줄여 배치합니다.
// 단계 전체는 컨테이너 너비에 맞춰 ScaledStage가 같이 줄고 늘립니다.
const CARD_WIDTH = 600;
const BUILDING_ASPECT = 131.134 / 316.92;

/** 카드마다 달라지는 숫자·유형. 이름·주소·날짜·문구는 번역 파일의 page.samples에 순서대로 있습니다 */
const SAMPLE_CARDS = [
  {
    category: "SMALL",
    isTargeted: true,
    price: 180000,
    rating: 5,
    reviewCount: 178,
    career: 7,
    confirmedCount: 334,
    favoriteCount: 136,
    isFavorited: true,
  },
  {
    category: "HOME",
    isTargeted: false,
    price: 320000,
    rating: 4.8,
    reviewCount: 92,
    career: 4,
    confirmedCount: 150,
    favoriteCount: 84,
    isFavorited: false,
  },
  {
    category: "OFFICE",
    isTargeted: true,
    price: 450000,
    rating: 4.9,
    reviewCount: 256,
    career: 10,
    confirmedCount: 512,
    favoriteCount: 221,
    isFavorited: true,
  },
  {
    category: "SMALL",
    isTargeted: false,
    price: 270000,
    rating: 4.7,
    reviewCount: 64,
    career: 3,
    confirmedCount: 98,
    favoriteCount: 57,
    isFavorited: false,
  },
] as const;

interface Sample {
  mover: string;
  from: string;
  to: string;
  date: string;
  title: string;
}

const STAGES = [
  {
    key: "sm",
    show: "tablet:hidden",
    width: 375,
    height: 1076,
    pinkTop: 237,
    building: { x: 183, y: 132, width: 253.535 },
    cardScale: 298.5 / CARD_WIDTH,
    cards: [
      [38.5, 273.5],
      [38.5, 526.5],
      [38.5, 780],
    ],
    title: { x: 32, y: 56.33, size: 20, line: 32, maxWidth: 311 },
  },
  {
    key: "md",
    show: "hidden tablet:block pc:hidden",
    width: 744,
    height: 1008,
    pinkTop: 310,
    building: { x: 416.69, y: 207, width: 253.535 },
    cardScale: 331.78 / CARD_WIDTH,
    cards: [
      [32, 209.85],
      [32, 492.1],
      [380.22, 387.27],
      [380.22, 669.52],
    ],
    title: { x: 32, y: 56.33, size: 32, line: 46, maxWidth: 680 },
  },
  {
    key: "lg",
    show: "hidden pc:block",
    width: 1920,
    height: 1081,
    pinkTop: 435,
    building: { x: 413, y: 304.33, width: 316.92 },
    cardScale: 390.33 / CARD_WIDTH,
    cards: [
      [873, 86],
      [873, 415.53],
      [1282.67, 294.73],
      [1282.67, 624.27],
    ],
    title: { x: 417, y: 153.33, size: 32, line: 46, maxWidth: 430 },
  },
] as const;

/**
 * 랜딩 "여러 업체의 견적을 한눈에 비교하고 선택해요" 섹션.
 * 배경·건물·카드·제목을 이미지가 아니라 코드로 그려서 문구는 다국어로 바뀌고,
 * 카드는 각각 독립된 요소라 따로 움직일 수 있습니다.
 */
export default async function CompareQuotesSection() {
  const t = await getTranslations("page");
  const samples = t.raw("samples") as Sample[];

  return (
    <section>
      {STAGES.map((stage) => (
        <ScaledStage
          key={stage.key}
          width={stage.width}
          height={stage.height}
          className={stage.show}
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-orange-100"
            style={{ top: stage.pinkTop }}
          />
          <Image
            src={building}
            alt=""
            className="absolute max-w-none"
            style={{
              left: stage.building.x,
              top: stage.building.y,
              width: stage.building.width,
              height: stage.building.width * BUILDING_ASPECT,
            }}
          />

          <h2
            className="text-black-black-400 absolute font-bold whitespace-pre-line"
            style={{
              left: stage.title.x,
              top: stage.title.y,
              maxWidth: stage.title.maxWidth,
              fontSize: stage.title.size,
              lineHeight: `${stage.title.line}px`,
            }}
          >
            <Reveal tag="span" className="block" y={24} blur={6}>
              {t("compareTitle1")}
            </Reveal>
            <Reveal tag="span" className="block" y={24} blur={6} delay={0.12}>
              <Highlight>{t("compareTitle2")}</Highlight>
            </Reveal>
          </h2>

          <QuoteSelection count={stage.cards.length}>
            {stage.cards.map(([x, y], index) => {
              const isRight = x > stage.width / 2;
              const card = SAMPLE_CARDS[index % SAMPLE_CARDS.length];
              const sample = samples[index % samples.length];

              return (
                <div
                  key={`${x}-${y}`}
                  className="absolute origin-top-left"
                  style={{ left: x, top: y, width: CARD_WIDTH, scale: stage.cardScale }}
                >
                  {/* 두 열이 서로 다른 속도로 움직여서 어긋난 배치에 깊이를 줍니다 (오른쪽이 더 큼).
                    크기 맞춤 scale은 바깥 div가 갖고 있어서 움직임은 안쪽에서 처리합니다 */}
                  <Parallax from={isRight ? 60 : 20} to={isRight ? -60 : -20}>
                    <AnimatedQuoteCard
                      index={index}
                      size="lg"
                      hideStatus
                      buttonsInert
                      {...card}
                      title={sample.title}
                      nickName={sample.mover}
                      movingInfo={{ from: sample.from, to: sample.to, movingDate: sample.date }}
                    />
                  </Parallax>
                </div>
              );
            })}
          </QuoteSelection>
        </ScaledStage>
      ))}
    </section>
  );
}
