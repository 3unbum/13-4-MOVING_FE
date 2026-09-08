import logoMark from "@/assets/icons/logo-mark-sm.svg";
import clsx from "clsx";
import Image from "next/image";
import type { HTMLAttributes } from "react";

type MoverNameSize = "sm" | "md" | "lg";

interface MoverNameProps extends HTMLAttributes<HTMLDivElement> {
  nickName: string;
  /** lg는 text-16, 나머지는 text-14 */
  size?: MoverNameSize;
}

// 사용법: <MoverName nickName="김코드" size="lg" />
export default function MoverName({ nickName, size = "sm", className, ...props }: MoverNameProps) {
  return (
    <div className={clsx("flex items-center gap-1", className)} {...props}>
      <Image src={logoMark} alt="" className="h-[23px] w-5 shrink-0" />
      <span
        className={clsx(
          "text-black-300 flex items-center gap-1 font-semibold whitespace-nowrap",
          size === "lg" ? "text-16" : "text-14"
        )}
      >
        <span>{nickName}</span>
        <span>기사님</span>
      </span>
    </div>
  );
}
