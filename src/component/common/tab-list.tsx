"use client";

import clsx from "clsx";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";

interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function TabList({ children, className, onKeyDown, ...props }: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
    );
    if (tabs.length === 0) return;

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    nextTab.focus();
    nextTab.click();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
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
