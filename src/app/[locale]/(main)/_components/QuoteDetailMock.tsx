"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import alarmMd from "@/assets/icons/alarm-md.svg";
import logoMark from "@/assets/icons/logo-mark-sm.svg";
import menuMd from "@/assets/icons/menu-md.svg";
import profileMdDefault from "@/assets/icons/profile-md-default.svg";
import logoSm from "@/assets/images/common/logo-icon-text-sm.svg";
import { FavoriteCount, PendingBadge } from "@/components/common/CardParts";
import { useCountUp } from "@/hooks/useCountUp";
import Header from "@/components/common/Header";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import MoveTypeChip from "@/components/filter/ChipMoveType";
import MoverMeta from "@/components/mover/MoverMeta";
import MoverName from "@/components/mover/MoverName";
import { formatPrice, formatRequestDate, formatUsageDate, type DateLocale } from "@/lib/utils/date";
import { QUOTE_DETAIL_MOCK_SIZE } from "./QuoteDetailMockSize";

interface Sample {
  mover: string;
  title: string;
}

/** 견적 정보 한 줄. 화면에 들어오면 위에서부터 차례로 나타납니다 (index가 클수록 늦게) */
function InfoRow({ label, value, index }: { label: string; value: string; index: number }) {
  const reduce = useReducedMotion();
  const fade = {
    initial: reduce ? false : { opacity: 0, x: -16 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 0.5, delay: 0.5 + index * 0.12, ease: "easeOut" as const },
  };

  return (
    <>
      <motion.span {...fade} className="text-16 text-gray-gray-300 font-normal whitespace-nowrap">
        {label}
      </motion.span>
      <motion.span
        {...fade}
        className="text-16 text-black-black-450 min-w-0 text-left font-semibold"
      >
        {value}
      </motion.span>
    </>
  );
}

/**
 * 랜딩 img3의 "견적 상세" 화면 목업.
 * 이미지에 박혀 있던 화면을 실제 견적 상세(QuoteDetailView)의 태블릿 레이아웃 그대로,
 * 같은 부품(Header·ProfileAvatar·칩·배지·MoverName·FavoriteCount·MoverMeta)으로 다시 그렸습니다.
 * 그림자는 이미지(img3)에 남아 있습니다 — ScaledStage가 바깥을 잘라서 여기서는 그리지 않습니다.
 * 그래서 글자는 번역을 따르고 찜 하트도 페이지 전체와 같은 빨강입니다.
 *
 * QuoteDetailView를 그대로 못 쓰는 이유: 실제 견적 데이터가 필요하고, 하단에 화면 고정(fixed)
 * 버튼이 붙고, 뷰포트 너비로 레이아웃이 바뀌어서 이 안에서는 크기를 고정할 수 없습니다.
 */
export default function QuoteDetailMock() {
  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const tService = useTranslations("service");
  const tPage = useTranslations("page");
  const locale = useLocale() as DateLocale;
  const sample = (tPage.raw("samples") as Sample[])[0];
  const reduce = useReducedMotion();
  const { ref: priceRef, value: price } = useCountUp<HTMLSpanElement>(180000, { delay: 0.4 });

  return (
    <div
      className="flex flex-col overflow-hidden rounded-4xl bg-white"
      style={QUOTE_DETAIL_MOCK_SIZE}
    >
      {/* GNB — 로그인한 상태의 모바일 GNB와 같은 구성 (로고 + 알림·프로필·메뉴) */}
      <div className="flex h-18.25 shrink-0 items-center justify-between px-18">
        <Image src={logoSm} alt="" className="h-8 w-auto" />
        <div className="flex items-center gap-4">
          <Image src={alarmMd} alt="" className="size-7" />
          <Image src={profileMdDefault} alt="" className="size-7" />
          <Image src={menuMd} alt="" className="size-7" />
        </div>
      </div>
      <Header size="md">{t("detailTitle")}</Header>

      {/* 히어로 — 주황 배경에 무빙 로고 마크 (QuoteDetailView와 같은 값) */}
      <div className="relative h-39.25 w-full shrink-0 overflow-hidden bg-orange-400" aria-hidden>
        <Image
          src={logoMark}
          alt=""
          className="pointer-events-none absolute -top-4 left-[8%] w-24 opacity-15"
        />
        <Image
          src={logoMark}
          alt=""
          className="pointer-events-none absolute top-6 left-[58%] w-32 opacity-15"
        />
      </div>

      <div className="flex min-h-0 flex-1 justify-center px-18">
        <div className="flex w-full max-w-150 flex-col gap-8">
          <div className="-mt-19.25">
            <ProfileAvatar src={null} alt={sample.mover} size="100" />
          </div>

          <div className="flex w-full items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <MoveTypeChip variant="SMALL" size="sm" />
              <MoveTypeChip variant="TARGETED" size="sm" />
            </div>
          </div>

          <div className="flex w-full items-start justify-between gap-3">
            <p className="text-24 text-black-black-300 min-w-0 font-semibold">{sample.title}</p>
            <div className="shrink-0">
              <PendingBadge />
            </div>
          </div>

          <div className="border-line-100 flex flex-col gap-2 border-b pb-8">
            <div className="flex w-full items-center justify-between">
              <MoverName
                nickName={sample.mover}
                size="xl"
                textClassName="text-black-black-300 font-semibold"
              />
              {/* 화면에 들어온 뒤 한 번 콩 뛰는 하트 */}
              <motion.div
                whileInView={reduce ? undefined : { scale: [1, 1.35, 1] }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: 1.1, ease: "easeOut" }}
              >
                <FavoriteCount
                  count={136}
                  isFavorited
                  countFirst
                  countClassName="text-14 tablet:text-18 text-gray-gray-500 font-medium"
                  className="shrink-0"
                />
              </motion.div>
            </div>
            <MoverMeta rating={5} reviewCount={178} career={7} confirmedCount={334} />
          </div>

          <div className="border-line-100 flex items-center justify-start border-b pb-8">
            <span className="text-16 text-black-black-450 min-w-22.5 font-semibold whitespace-nowrap">
              {t("quotePrice")}
            </span>
            <span ref={priceRef} className="text-18 text-black-black-450 ml-5.75 font-bold">
              {formatPrice(price, locale)}
            </span>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-16 text-black-black-450 font-semibold">{t("quoteInfo")}</h2>
            <div className="grid grid-cols-[minmax(5.625rem,auto)_1fr] gap-x-5.75 gap-y-4">
              <InfoRow
                index={0}
                label={t("requestDate")}
                value={formatRequestDate("2026-10-06T09:00:00+09:00")}
              />
              <InfoRow index={1} label={t("service")} value={tService("OFFICE")} />
              <InfoRow
                index={2}
                label={t("usageDate")}
                value={formatUsageDate("2026-10-12T10:00:00+09:00", locale)}
              />
              <InfoRow index={3} label={tCommon("from")} value={tPage("mockFrom")} />
              <InfoRow index={4} label={tCommon("to")} value={tPage("mockTo")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
