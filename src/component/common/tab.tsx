import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
  id: string;
  controls: string;
}

export default function Tab({
  children,
  active = false,
  id,
  controls,
  className,
  type = "button",
  ...props
}: TabProps) {
  return (
    <button
      id={id}
      type={type}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      className={clsx(
        "text-14 flex h-[54px] shrink-0 items-center border-b-2 border-solid whitespace-nowrap",
        "pc:h-auto pc:py-4 pc:text-20",
        active
          ? "border-black-400 text-black-500 pc:border-black-500 pc:font-semibold font-bold"
          : "border-transparent font-semibold text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
