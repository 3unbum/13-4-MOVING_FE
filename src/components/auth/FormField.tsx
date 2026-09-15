import type { InputHTMLAttributes, Ref } from "react";
import InputTextField from "@/components/common/InputTextfield";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  errorMessage?: string;
  // React 19부터 ref를 일반 prop으로 받을 수 있어 forwardRef 없이 register의 ref를 input까지 전달
  ref?: Ref<HTMLInputElement>;
}

export default function FormField({ label, id, errorMessage, ref, ...props }: FormFieldProps) {
  return (
    <div className="tablet:gap-4 flex flex-col gap-2">
      <label htmlFor={id} className="tablet:text-20 text-black-black-400 text-14">
        {label}
      </label>
      {/* size="sm" 높이(54px)는 Figma와 맞지만 태블릿 이상 폰트는 18px이 필요 — InputTextField(공통
          컴포넌트)는 안 건드리고 [&_input] 선택자로 내부 input만 직접 타겟팅해서 해결 */}
      <InputTextField
        id={id}
        size="sm"
        className="tablet:[&_input]:text-18"
        errorMessage={errorMessage}
        ref={ref}
        {...props}
      />
    </div>
  );
}
