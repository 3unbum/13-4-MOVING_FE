"use client";

import MoverBasicInfoEditForm from "@/components/profile/MoverBasicInfoEditForm";
import { useMoverAccount } from "@/hooks/useMoverAccount";
import type { MoverAccountResponse } from "@/lib/services/auth-service";

interface MoverBasicInfoEditPanelProps {
  initialAccount: MoverAccountResponse | null;
}

// 피그마 "마이페이지_기본정보 수정_기사님"(#73) 대응. 마이페이지 화면(PR #132)의 "기본 정보 수정"
// 버튼에서 이 라우트(/mover/mypage/edit/basic-info)로 들어온다 — 탭이 아니라 독립된 화면.
export default function MoverBasicInfoEditPanel({ initialAccount }: MoverBasicInfoEditPanelProps) {
  const { account, isLoading, error, setAccount } = useMoverAccount(initialAccount);

  if (isLoading) {
    return <p className="text-14 text-black-100 pc:text-16">불러오는 중...</p>;
  }

  if (!account) {
    return <p className="text-14 pc:text-16 text-red-200">{error}</p>;
  }

  return <MoverBasicInfoEditForm account={account} onAccountUpdated={setAccount} />;
}
