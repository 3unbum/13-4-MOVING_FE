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

    // 매 tick마다 1씩 빼면 브라우저가 백그라운드 탭의 타이머를 늦출 때 실제 시간보다 느려지므로,
    // 종료 시각을 고정해 두고 매번 남은 시간을 다시 계산한다.
    const endAt = Date.now() + seconds * 1000;
    setRemainingSeconds(seconds);
    timerRef.current = setInterval(() => {
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemainingSeconds(next);
      if (next === 0 && timerRef.current) clearInterval(timerRef.current);
    }, 1000);
  };

  return { remainingSeconds, start };
}
