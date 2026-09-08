import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function TabList({ children, className, ...props }: TabListProps) {
  return (
    <div
      role="tablist"
      className={clsx(
        "border-line-100 flex w-full items-center gap-6 border-b bg-gray-50 px-6 py-2.5",
        "tablet:px-18 tablet:shadow-[0px_2px_5px_rgba(248,248,248,0.2)]",
        "pc:items-start pc:gap-8 pc:px-[360px] pc:pt-4 pc:pb-0 pc:shadow-[0px_2px_5px_rgba(248,248,248,0.1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
