"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * width × height 디자인 캔버스를 컨테이너 너비에 맞춰 통째로 줄이고 늘립니다.
 * 안쪽 children은 디자인 좌표(px) 그대로 배치하면 됩니다.
 *
 * 배율은 ResizeObserver로 직접 잽니다. CSS만으로 구하는 방법
 * (`tan(atan2(100cqw, …))`)은 Safari에서 배율이 0이 되어 아무것도 안 보인 적이 있습니다.
 * 첫 렌더(서버)에서는 그 CSS 값을 임시로 쓰고, 마운트되면 잰 값으로 바꿉니다.
 */
export default function ScaledStage({
  width,
  height,
  className,
  children,
}: {
  width: number;
  height: number;
  className?: string;
  children: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const update = () => setScale(box.clientWidth / width);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={boxRef}
      className={`${className ?? ""} @container relative w-full overflow-hidden`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width,
          height,
          scale: scale ?? `tan(atan2(100cqw, ${width}px))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
