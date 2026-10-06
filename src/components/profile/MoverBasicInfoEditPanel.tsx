"use client";

import MoverBasicInfoEditForm from "@/components/profile/MoverBasicInfoEditForm";
import ProfileEmailVerificationGate from "@/components/profile/ProfileEmailVerificationGate";
import { useTranslations } from "next-intl";
import { useMoverAccount } from "@/hooks/useMoverAccount";
import type { MoverAccountResponse } from "@/lib/services/auth-service";

interface MoverBasicInfoEditPanelProps {
  initialAccount: MoverAccountResponse | null;
}

// 피그마 "마이페이지_기본정보 수정_기사님"(#73) 대응. 마이페이지 화면(PR #132)의 "기본 정보 수정"
// 버튼에서 이 라우트(/mover/mypage/edit/basic-info)로 들어온다 — 탭이 아니라 독립된 화면.
export default function MoverBasicInfoEditPanel({ initialAccount }: MoverBasicInfoEditPanelProps) {
  const tCommon = useTranslations("common");
  const tProfile = useTranslations("profile");
  const { account, isLoading, setAccount } = useMoverAccount(initialAccount);

  if (isLoading) {
    return <p className="text-14 text-black-100 pc:text-16">{tCommon("loading")}</p>;
  }

  if (!account) {
    return <p className="text-14 pc:text-16 text-red-200">{tProfile("accountLoadFailed")}</p>;
  }

  return (
    // #131: 이 화면은 비밀번호 변경이 가능한 화면이라 진입 자체를 이메일 인증으로 한 번 더 막는다
    // (CustomerProfileEditForm과 동일 패턴). "내 프로필 수정"(MoverProfileEditPanel, 별명/경력 등)은
    // 비밀번호를 다루지 않아 이 게이트를 적용하지 않는다.
    <ProfileEmailVerificationGate email={account.email}>
      <MoverBasicInfoEditForm account={account} onAccountUpdated={setAccount} />
    </ProfileEmailVerificationGate>
  );
}
