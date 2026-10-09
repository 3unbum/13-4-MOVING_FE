import type { InputHTMLAttributes, Ref } from "react";
import InputTextField from "@/components/common/InputTextfield";
import { cn } from "@/lib/utils/cn";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  errorMessage?: string;
  // 기본 "sm"(54px), 호출부가 필요할 때만 "md"(64px/18px)로 올린다
  size?: "sm" | "md";
  // React 19부터 ref를 일반 prop으로 받을 수 있어 forwardRef 없이 register의 ref를 input까지 전달
  ref?: Ref<HTMLInputElement>;
}

export default function FormField({
  label,
  id,
  errorMessage,
  size = "sm",
  ref,
  ...props
}: FormFieldProps) {
  return (
    <div className="tablet:gap-4 flex flex-col gap-2">
      <label
        htmlFor={id}
        className="tablet:text-20 text-black-black-400 text-14 tablet:font-semibold font-semibold"
      >
        {label}
      </label>
      {/* size="sm" 높이(54px)는 Figma와 맞지만 태블릿 이상 폰트는 18px이 필요 — InputTextField(공통
          컴포넌트)는 안 건드리고 [&_input] 선택자로 내부 input만 직접 타겟팅해서 해결 */}
      {/* readOnly(예: 회원가입 이메일 인증 중 잠금)는 RHF 값을 유지해야 해서 disabled를 쓸 수 없다 — disabled는
          값을 undefined로 만든다. 대신 InputTextField(공통)의 disabled 모습을 입력 박스(>div)에 똑같이 입힌다 */}
      <InputTextField
        id={id}
        size={size}
        className={cn(
          "tablet:[&_input]:text-18",
          props.readOnly &&
            !props.disabled &&
            "[&_input]:cursor-not-allowed [&>div]:cursor-not-allowed [&>div]:opacity-40"
        )}
        errorMessage={errorMessage}
        ref={ref}
        {...props}
      />
    </div>
  );
}
