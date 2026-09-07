import clsx from "clsx";
import Image from "next/image";
import type { InputHTMLAttributes } from "react";
import checkIcon from "@/assets/icons/check.svg";

type CheckboxShape = "round" | "square";

interface CheckboxButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  // round: 24px 원형 (기본, 다중 선택 등) / square: 36px 사각형 (약관 동의 등)
  shape?: CheckboxShape;
}

// 순수 CSS(group-has-[:checked])로 체크 상태를 표현 — 별도 상태 관리 없이 네이티브
// <input type="checkbox">라 react-hook-form의 register(...)를 그대로 spread해서 쓸 수 있음
export default function CheckboxButton({
  shape = "round",
  className,
  ...props
}: CheckboxButtonProps) {
  return (
    <label
      className={clsx(
        "group relative inline-flex shrink-0 cursor-pointer items-center justify-center",
        shape === "round" ? "size-6" : "size-9",
        className
      )}
    >
      <input type="checkbox" className="sr-only" {...props} />
      <span
        className={clsx(
          "border-line-200 flex items-center justify-center border bg-gray-50 transition-colors",
          "group-has-[:checked]:border-orange-400 group-has-[:checked]:bg-orange-400",
          "group-has-[:disabled]:cursor-not-allowed group-has-[:disabled]:opacity-40",
          shape === "round" ? "size-[18px] rounded-full" : "size-5 rounded-[4px]"
        )}
      >
        <Image
          src={checkIcon}
          alt=""
          className={clsx(
            "h-auto opacity-0 transition-opacity group-has-[:checked]:opacity-100",
            shape === "round" ? "w-2" : "w-3"
          )}
        />
      </span>
    </label>
  );
}
