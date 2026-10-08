"use client";

import DeleteAccountSection from "@/components/profile/DeleteAccountSection";
import MoverBasicInfoEditForm from "@/components/profile/MoverBasicInfoEditForm";
import ProfileEmailVerificationGate from "@/components/profile/ProfileEmailVerificationGate";
import { useProfileEditVerified } from "@/hooks/useProfileEditVerified";
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
  const { isVerified, setVerified } = useProfileEditVerified(account?.isProfileEditVerified);

  if (isLoading) {
    return <p className="text-14 text-black-100 pc:text-16">{tCommon("loading")}</p>;
  }

  if (!account) {
    return <p className="text-14 pc:text-16 text-red-200">{tProfile("accountLoadFailed")}</p>;
  }

  return (
    // #131: 프로필 수정 진입은 이메일 인증을 한 번 거친다 (MoverProfileEditPanel / CustomerProfileEditForm과 동일 패턴)
    <ProfileEmailVerificationGate
      email={account.email}
      isVerified={isVerified}
      onVerified={() => setVerified(true)}
    >
      <MoverBasicInfoEditForm
        account={account}
        onAccountUpdated={setAccount}
        onVerificationRequired={() => setVerified(false)}
      />
      <DeleteAccountSection onVerificationRequired={() => setVerified(false)} />
    </ProfileEmailVerificationGate>
  );
}
