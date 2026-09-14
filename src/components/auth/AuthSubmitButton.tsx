import type { ReactNode } from "react";
import Button from "@/components/common/Button";

interface AuthSubmitButtonProps {
  disabled: boolean;
  // 서버 에러 등 특정 필드에 속하지 않는 에러(RHF errors.root) — 버튼 바로 위에 표시
  errorMessage?: string;
  children: ReactNode;
}

// Fragment로 반환해 부모 form의 gap이 에러 문구·버튼 사이에도 그대로 적용되게 함
export default function AuthSubmitButton({
  disabled,
  errorMessage,
  children,
}: AuthSubmitButtonProps) {
  return (
    <>
      {errorMessage && (
        <p className="text-13 tablet:text-16 text-center text-red-200">{errorMessage}</p>
      )}
      {/* 모바일 54px vs 태블릿·PC 60px — 버튼이 중복 마운트되지 않도록 한 인스턴스에 breakpoint별 className만 덮어씀 */}
      <Button
        type="submit"
        size="sm"
        disabled={disabled}
        className="tablet:h-15 tablet:gap-2 tablet:rounded-2xl tablet:text-18"
      >
        {children}
      </Button>
    </>
  );
}
