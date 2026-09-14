"use client";

import { useEffect, useState } from "react";

/**
 * 값이 `delay`(ms) 동안 더 바뀌지 않을 때까지 반영을 미룬다.
 * 검색어 입력처럼 타이핑마다 API를 호출하면 안 되는 곳에 쓴다.
 *
 * 사용:
 *   const [keyword, setKeyword] = useState("");
 *   const debouncedKeyword = useDebounce(keyword, 300);
 *   useEffect(() => { // debouncedKeyword가 바뀔 때만 호출
 *   }, [debouncedKeyword]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
