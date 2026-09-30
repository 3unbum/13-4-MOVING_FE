"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Header from "@/components/common/Header";
import { moverQueryKeys } from "@/constants/query-keys/movers";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { moverService } from "@/lib/services/mover-service";
import { useAuth } from "@/providers/AuthProvider";
import MoverMyPageContent from "./_components/MoverMyPageContent";
import MoverProfileBanner from "./_components/MoverProfileBanner";

const TABLET_QUERY = "(min-width: 744px)";
const PC_QUERY = "(min-width: 1280px)";

export default function MoverMyPage() {
  const t = useTranslations("moverPage");
  const tCommon = useTranslations("common");
  const { account, isLoading: isAccountLoading } = useAuth();
  const isTabletUp = useMediaQuery(TABLET_QUERY);
  const isPc = useMediaQuery(PC_QUERY);
  const headerSize = isPc ? "lg" : isTabletUp ? "md" : "sm";
  const moverId = account?.role === "MOVER" ? account.userId : undefined;

  const profileQuery = useQuery({
    queryKey: moverQueryKeys.detail(moverId ?? 0),
    queryFn: () => moverService.getById(moverId!),
    enabled: moverId != null,
  });

  const isLoading = isAccountLoading || (moverId != null && profileQuery.isPending);

  return (
    <div className="pc:min-h-[calc(100dvh-88px)] flex min-h-[calc(100dvh-54px)] flex-1 flex-col bg-white">
      <Header size={headerSize}>{t("myPage")}</Header>
      <MoverProfileBanner />

      {isLoading && (
        <p className="text-16 text-gray-gray-400 flex-1 py-20 text-center" role="status">
          {tCommon("loading")}
        </p>
      )}

      {!isLoading && (profileQuery.isError || !profileQuery.data) && (
        <p className="text-16 text-gray-gray-400 flex-1 py-20 text-center">
          {t("profileLoadFailed")}
        </p>
      )}

      {!isLoading && profileQuery.data && (
        <MoverMyPageContent mover={profileQuery.data} moverId={profileQuery.data.id} />
      )}
    </div>
  );
}
