/** "01:15" — 로그인 rate limit 잠금 등, 초 단위로 내려오는 값을 mm:ss로 표시할 때 쓴다. */
// padStart는 05:05 와 같은식으로 0을 붙여 시간을 나타내기 위해 사용
export function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
