import clsx from "clsx";
import Image from "next/image";
import type { InputHTMLAttributes } from "react";
import checkIcon from "@/assets/icons/check.svg";

type CheckboxShape = "round" | "square";

interface CheckboxButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  shape?: CheckboxShape;
}

// 순수 CSS(group-has-[:checked])로 체크 상태를 표현 — 별도 상태 관리 없이 네이티브
// <input type="checkbox">라 react-hook-form의 register(...)를 그대로 spread해서 쓸 수 있음
// group-has-[:checked]는 className에 "group"이 붙은 조상(아래 label) 안에 :checked 요소가 있어야 감지됨 —
// label의 "group" 클래스명을 지우거나 바꾸면 체크 스타일이 조용히 깨지니 유지할 것
// 접근 가능한 이름(aria-label)은 웹 접근성 심화 단계에서 별도로 다룰 예정 — 지금은 optional로 둠

// 사용 예: <CheckboxButton shape="round" checked={isChecked} onChange={toggleChecked} />
//         <CheckboxButton shape="square" {...register("agree")} />
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
          // input이 sr-only라 기본 포커스 아웃라인이 안 보임 — 키보드 포커스 시 span에 대신 표시
          "group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-2 group-has-[:focus-visible]:outline-orange-400",
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
