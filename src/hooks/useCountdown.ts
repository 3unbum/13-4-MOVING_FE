import { useEffect, useRef, useState } from "react";

/**
 * 초 단위 카운트다운. `start(seconds)`로 시작하면 매초 감소하다 0에서 자동으로 멈춘다.
 * 로그인 rate limit(429) 잠금처럼 "남은 시간" 자체를 화면에 보여줘야 할 때 쓴다.
 */
export function useCountdown() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const start = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setRemainingSeconds(seconds);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return { remainingSeconds, start };
}
