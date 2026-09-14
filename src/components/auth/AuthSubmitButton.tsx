import type { ReactNode } from "react";
import Button from "@/components/common/Button";

interface AuthSubmitButtonProps {
  disabled: boolean;
  // 특정 필드에 속하지 않는 폼 전체 에러(RHF errors.root)
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
      {/* Button size는 반응형이 아니라 sm(54px) 하나만 쓰고, 태블릿 이상은 className으로 md 값(60px)을 덮어씀 */}
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
