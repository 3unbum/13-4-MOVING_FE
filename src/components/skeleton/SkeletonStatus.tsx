import type { ReactNode } from "react";

interface SkeletonStatusProps {
  /** 스크린 리더가 읽을 로딩 문구 */
  label: string;
  className?: string;
  children: ReactNode;
}

/**
 * 스켈레톤 영역. 막대는 전부 aria-hidden이라 스크린 리더에는 label 한 줄만 읽힌다.
 * aria-busy를 같이 주면 로딩이 끝날 때까지 이 문구 자체가 읽히지 않아 넣지 않는다.
 */
export default function SkeletonStatus({ label, className, children }: SkeletonStatusProps) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
