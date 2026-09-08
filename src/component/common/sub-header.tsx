import { HTMLAttributes, ReactNode } from "react";

interface SubHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: SubHeaderSize;
}

type SubHeaderSize = "sm" | "md" | "lg";
const LG_SIZE = "";

export default function SubHeader({ children, size, className, ...props }: SubHeaderProps) {
  const isMd = size === "md";
  const isLg = size === "lg";
  return <section className=""></section>;
}
