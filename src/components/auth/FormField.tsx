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
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="tablet:text-18 pc:text-20 text-black-black-400 text-14">
        {label}
      </label>
      <InputTextField id={id} size="sm" errorMessage={errorMessage} ref={ref} {...props} />
    </div>
  );
}
