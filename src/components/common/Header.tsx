import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type HeaderSize = "sm" | "md" | "lg";

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: HeaderSize;
}

const SM_SIZE = "py-3.5 pl-7.5";
const MD_SIZE = "px-18 py-3.5";
const LG_SIZE = "flex w-full items-center px-92 py-8 text-24";

// 사용법: <Header size="lg">제목 텍스트</Header>
export default function Header({ children, size = "sm", className, ...props }: HeaderProps) {
  const isMd = size === "md";
  const isLg = size === "lg";

  return (
    <section
      className={clsx(
        "text-18 text-black-500 bg-gray-50 font-semibold",
        !isMd && !isLg && SM_SIZE,
        isMd && MD_SIZE,
        isLg && LG_SIZE,
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
