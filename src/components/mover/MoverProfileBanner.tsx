// "M" 낙서 무늬는 이미지가 아니라 피그마 도형(타원 겹침)을 그대로 div로 옮긴 장식.
// 모바일만 전체 비율이 약 0.547배로 작아서 scale로 축소하고, 위치만 breakpoint별로 바꾼다.
function BigCluster() {
  return (
    <div
      aria-hidden
      className="tablet:left-[calc(50%+185.27px)] tablet:top-[calc(50%+55.65px)] pc:left-[calc(50%+314.27px)] pc:top-[calc(50%+61.15px)] absolute top-[calc(50%+31.17px)] left-[calc(50%+80.27px)] flex h-59 w-81.25 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
    >
      <div className="tablet:scale-100 scale-[0.547] rotate-[15.67deg]">
        <div className="relative flex h-41 w-72.75 flex-col items-center justify-center opacity-20">
          <div className="absolute top-2.5 left-47 h-34.5 w-12.75 rounded-full bg-orange-100" />
          <div className="absolute top-2.75 left-25 h-34.5 w-12.75 rounded-full bg-orange-100" />
          <div className="absolute top-0 left-0 flex h-40 w-40 items-center justify-center">
            <div className="rotate-[45.48deg]">
              <div className="h-44 w-12.75 rounded-full bg-orange-100 opacity-80" />
            </div>
          </div>
          <div className="absolute top-13.5 left-44.5 flex h-26.25 w-26.5 items-center justify-center">
            <div className="rotate-[45.48deg]">
              <div className="h-24.75 w-12.5 rounded-full bg-orange-100 opacity-80" />
            </div>
          </div>
          <div className="absolute top-0 left-22 flex h-40 w-40 items-center justify-center">
            <div className="rotate-[45.48deg]">
              <div className="h-43.5 w-13 rounded-full bg-orange-100 opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallCluster() {
  return (
    <div
      aria-hidden
      className="tablet:left-[calc(50%-329.19px)] tablet:top-[calc(50%-12.1px)] pc:left-[calc(50%-665.19px)] pc:top-[calc(50%-6.6px)] absolute top-[calc(50%-9.29px)] left-[calc(50%-169.11px)] flex h-28.75 w-42.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
    >
      <div className="tablet:scale-100 scale-[0.547] rotate-[-10.46deg]">
        <div className="relative flex h-22 w-39 flex-col items-center justify-center opacity-20">
          <div className="absolute top-1.5 left-25.25 h-18.5 w-7 rounded-full bg-orange-100" />
          <div className="absolute top-1.5 left-13.25 h-18.5 w-7 rounded-full bg-orange-100" />
          <div className="absolute top-0 left-0 flex h-21.5 w-21.5 items-center justify-center">
            <div className="rotate-[45.48deg]">
              <div className="h-23.5 w-7 rounded-full bg-orange-100 opacity-80" />
            </div>
          </div>
          <div className="absolute top-7.25 left-24 flex h-14 w-14.25 items-center justify-center">
            <div className="rotate-[45.48deg]">
              <div className="h-13.25 w-6.75 rounded-full bg-orange-100 opacity-80" />
            </div>
          </div>
          <div className="absolute top-0 left-12 flex h-21.5 w-21.5 items-center justify-center">
            <div className="rotate-[45.48deg]">
              <div className="h-23.5 w-7 rounded-full bg-orange-100 opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 사용법: <MoverProfileBanner /> — 부모가 relative + overflow-hidden 이어야 함
export default function MoverProfileBanner() {
  return (
    <div className="tablet:h-39.25 pc:h-45 relative h-30.5 w-full overflow-hidden bg-orange-400">
      <BigCluster />
      <SmallCluster />
    </div>
  );
}
