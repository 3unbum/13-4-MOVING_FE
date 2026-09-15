"use client";

import { useId } from "react";
import Button from "@/components/common/Button";
import Modal, { ModalHeader } from "@/components/common/Modal";

interface ProfileRegisterModalProps {
  open: boolean;
  // 오버레이 클릭·esc·닫기 버튼·"다음에 할게요" 모두 이 핸들러로 처리
  onSkip: () => void;
  onRegister: () => void;
}

export default function ProfileRegisterModal({
  open,
  onSkip,
  onRegister,
}: ProfileRegisterModalProps) {
  const titleId = useId();

  return (
    <Modal
      open={open}
      onClose={onSkip}
      labelledBy={titleId}
      className="tablet:w-152 tablet:min-w-152 w-[calc(100vw-2rem)] max-w-93.75 min-w-0 gap-10 rounded-4xl px-6 pt-8 pb-10"
    >
      <ModalHeader id={titleId} title="프로필을 등록하시겠어요?" size="md" onClose={onSkip} />
      <p className="text-18 text-black-300 w-full font-medium">
        프로필을 등록하면 견적 요청, 찜하기 등 무빙의 모든 서비스를 바로 이용할 수 있어요.
      </p>
      <div className="flex w-full gap-3">
        <Button variant="outlined" size="lg" onClick={onSkip}>
          다음에 할게요
        </Button>
        <Button variant="solid" size="lg" onClick={onRegister}>
          등록하러 가기
        </Button>
      </div>
    </Modal>
  );
}
