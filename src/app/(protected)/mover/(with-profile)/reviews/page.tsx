"use client";

import Header from "@/components/common/Header";
import MoverReviewSection from "@/components/review/MoverReviewSection";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/providers/AuthProvider";

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

export default function MoverReviewsPage() {
  const { account } = useAuth();
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const isPc = useMediaQuery(PC_QUERY);
  const moverId = account?.role === "MOVER" ? account.userId : undefined;
  const headerSize = isPc ? "lg" : isTabletUp ? "md" : "sm";

  return (
    <div className="pc:min-h-[calc(100dvh-88px)] flex min-h-[calc(100dvh-54px)] flex-1 flex-col bg-gray-50">
      <Header size={headerSize}>받은 리뷰</Header>
      <section className="tablet:px-18 pc:px-0 flex w-full flex-1 flex-col items-center px-5 pt-10 pb-10">
        <div className="tablet:max-w-[600px] pc:max-w-[821px] pc:w-[821px] flex w-full flex-col">
          <MoverReviewSection moverId={moverId} />
        </div>
      </section>
    </div>
  );
}
