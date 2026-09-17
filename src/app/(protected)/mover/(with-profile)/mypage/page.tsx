"use client";

import { useQuery } from "@tanstack/react-query";
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
      <Header size={headerSize}>마이페이지</Header>
      <MoverProfileBanner />

      {isLoading && (
        <p className="text-16 text-gray-gray-400 flex-1 py-20 text-center" role="status">
          불러오는 중이에요.
        </p>
      )}

      {!isLoading && (profileQuery.isError || !profileQuery.data) && (
        <p className="text-16 text-gray-gray-400 flex-1 py-20 text-center">
          프로필 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      {!isLoading && profileQuery.data && moverId != null && (
        <MoverMyPageContent mover={profileQuery.data} moverId={moverId} />
      )}
    </div>
  );
}
