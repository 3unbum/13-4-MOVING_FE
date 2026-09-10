"use client";

import alarmLg from "@/assets/icons/alarm-lg.svg";
import alarmMd from "@/assets/icons/alarm-md.svg";
import menuMd from "@/assets/icons/menu-md.svg";
import profileLgDefault from "@/assets/icons/profile-lg-default.svg";
import profileMdDefault from "@/assets/icons/profile-md-default.svg";
import logoLg from "@/assets/images/common/logo-icon-text-lg.svg";
import logoSm from "@/assets/images/common/logo-icon-text-sm.svg";
import Button from "@/component/common/button";
import DropdownNotification, {
  DropdownNotificationItem,
} from "@/component/common/dropdown-notification";
import DropdownProfile, { type DropdownProfileOption } from "@/component/common/dropdown-profile";
import GnbMenu, { getGnbNavItems, LOGOUT_NAV, type GnbRole } from "@/component/common/gnb-menu";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";

export interface GnbNotification {
  id: string;
  message: ReactNode;
  timeLabel: string;
}

// 열린 패널은 하나만 — 알림과 프로필이 동시에 뜨지 않도록 union으로 관리
type GnbPanel = "none" | "notification" | "profile";

interface GnbProps {
  isLoggedIn?: boolean;
  /** 로그인 시 역할에 따라 메뉴 분기 (customer: 3메뉴, mover: 2메뉴) */
  role?: GnbRole;
  userName?: string;
  /** 알림 패널에 표시할 목록 — 비어 있으면 헤더만 노출 */
  notifications?: GnbNotification[];
  /** 프로필 메뉴 항목 — 미지정 시 role별 기본값 */
  profileOptions?: DropdownProfileOption[];
  className?: string;
  onLoginClick?: () => void;
  onNotificationSelect?: (id: string) => void;
  onProfileSelect?: (value: string) => void;
}

// TODO: 라우트·로그아웃 액션 확정 후 상위에서 profileOptions로 주입하거나 여기서 연결 등 후속작업 진행
const CUSTOMER_PROFILE_OPTIONS: DropdownProfileOption[] = [
  { value: "edit", label: "프로필 수정" },
  { value: "favorite", label: "찜한 기사님" },
  { value: "review", label: "이사 리뷰" },
  { value: "logout", label: "로그아웃", tone: "muted" },
];

const MOVER_PROFILE_OPTIONS: DropdownProfileOption[] = [
  { value: "mypage", label: "마이페이지" },
  { value: "logout", label: "로그아웃", tone: "muted" },
];

/**
 * 공통 GNB — sm/md/lg는 tablet·pc 브레이크포인트로 대응
 *
 * @example
 * <Gnb isLoggedIn role="customer" userName="김가나" notifications={items} />
 * <Gnb isLoggedIn={false} onLoginClick={() => router.push("/customer/login")} />
 */
export default function Gnb({
  isLoggedIn = false,
  role = "customer",
  userName = "",
  notifications = [],
  profileOptions,
  className,
  onLoginClick,
  onNotificationSelect,
  onProfileSelect,
}: GnbProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<GnbPanel>("none");
  // 트리거와 패널을 함께 감싸서, 아이콘 클릭이 "바깥 클릭"으로 잡혀 바로 닫히는 걸 막는다
  const actionsRef = useRef<HTMLDivElement>(null);

  const navItems = getGnbNavItems(isLoggedIn, role);
  const menuOptions =
    profileOptions ?? (role === "mover" ? MOVER_PROFILE_OPTIONS : CUSTOMER_PROFILE_OPTIONS);
  const profileHeader = userName
    ? `${userName} ${role === "mover" ? "기사님" : "고객님"}`
    : undefined;

  const togglePanel = (panel: Exclude<GnbPanel, "none">) => {
    setOpenPanel((current) => (current === panel ? "none" : panel));
  };
  const closePanel = () => setOpenPanel("none");

  const renderNotificationItems = (size: "sm" | "md") =>
    notifications.map((notification) => (
      <DropdownNotificationItem
        key={notification.id}
        size={size}
        message={notification.message}
        timeLabel={notification.timeLabel}
        onClick={() => {
          closePanel();
          onNotificationSelect?.(notification.id);
        }}
      />
    ));

  const handleProfileSelect = (value: string) => {
    closePanel();
    onProfileSelect?.(value);
  };

  return (
    <>
      <header
        className={clsx(
          "flex w-full items-center bg-gray-50",
          "h-13.5 px-6 py-2.5",
          "tablet:px-18",
          "pc:h-22 pc:px-40 pc:py-6.5",
          isLoggedIn
            ? "pc:shadow-[inset_0_-1px_0_0_var(--color-line-100)]"
            : "shadow-[inset_0_-1px_0_0_var(--color-line-100)]",
          isLoggedIn ? "pc:justify-center" : "pc:justify-start pc:gap-20.5 justify-between",
          className
        )}
      >
        {isLoggedIn ? (
          <div className="pc:h-22 flex w-full flex-1 items-center justify-between">
            <div className="pc:h-full pc:gap-20 flex items-center">
              <LogoLink iconOnlyOnMobile />
              <nav className="pc:flex hidden h-full items-center gap-10" aria-label="주요 메뉴">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-18 text-black-500 flex h-22 items-center justify-center py-4 font-bold"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div ref={actionsRef} className="pc:gap-8 relative flex items-center justify-end gap-6">
              <button
                type="button"
                aria-label="알림"
                aria-expanded={openPanel === "notification"}
                onClick={() => togglePanel("notification")}
                className="pc:size-9 size-6"
              >
                <Image src={alarmMd} alt="" width={24} height={24} className="pc:hidden size-6" />
                <Image
                  src={alarmLg}
                  alt=""
                  width={36}
                  height={36}
                  className="pc:block hidden size-9"
                />
              </button>

              <button
                type="button"
                aria-label="프로필 메뉴"
                aria-expanded={openPanel === "profile"}
                onClick={() => togglePanel("profile")}
                className="pc:hidden size-6"
              >
                <Image src={profileMdDefault} alt="" width={24} height={24} className="size-6" />
              </button>

              <button
                type="button"
                aria-label="프로필 메뉴"
                aria-expanded={openPanel === "profile"}
                onClick={() => togglePanel("profile")}
                className="pc:flex hidden items-center gap-4"
              >
                <Image src={profileLgDefault} alt="" width={36} height={36} className="size-9" />
                {userName ? (
                  <span className="text-18 text-black-500 font-medium whitespace-nowrap">
                    {userName}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                aria-label="메뉴 열기"
                aria-expanded={isMenuOpen}
                onClick={() => {
                  closePanel();
                  setIsMenuOpen(true);
                }}
                className="pc:hidden size-6"
              >
                <Image src={menuMd} alt="" width={24} height={24} className="size-6" />
              </button>

              {openPanel === "notification" ? (
                <>
                  <div className="pc:hidden tablet:right-9 tablet:mt-[15px] absolute top-full -right-1 z-[var(--z-gnb-dropdown)] mt-[9px]">
                    <DropdownNotification size="sm" containerRef={actionsRef} onClose={closePanel}>
                      {renderNotificationItems("sm")}
                    </DropdownNotification>
                  </div>
                  <div className="pc:block absolute top-full right-[101px] z-[var(--z-gnb-dropdown)] mt-6.5 hidden">
                    <DropdownNotification size="md" containerRef={actionsRef} onClose={closePanel}>
                      {renderNotificationItems("md")}
                    </DropdownNotification>
                  </div>
                </>
              ) : null}

              {openPanel === "profile" ? (
                <>
                  <div className="pc:hidden tablet:-right-14 absolute top-full right-[-9.5px] z-[var(--z-gnb-dropdown)] mt-[13px]">
                    <DropdownProfile
                      size="sm"
                      header={profileHeader}
                      options={menuOptions}
                      containerRef={actionsRef}
                      onClose={closePanel}
                      onChange={handleProfileSelect}
                    />
                  </div>
                  <div className="pc:block absolute top-full -right-31 z-[var(--z-gnb-dropdown)] mt-4.5 hidden">
                    <DropdownProfile
                      size="md"
                      header={profileHeader}
                      options={menuOptions}
                      containerRef={actionsRef}
                      onClose={closePanel}
                      onChange={handleProfileSelect}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <LogoLink />

            <nav className="pc:block relative hidden h-6.5 flex-1" aria-label="주요 메뉴">
              {LOGOUT_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-18 text-black-500 absolute top-1/2 left-0 w-20.5 -translate-y-1/2 text-center font-bold whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pc:block hidden w-29 shrink-0">
              <Button size="xs" onClick={onLoginClick}>
                로그인
              </Button>
            </div>

            <button
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
              className="pc:hidden size-6"
            >
              <Image src={menuMd} alt="" width={24} height={24} className="size-6" />
            </button>
          </>
        )}
      </header>

      <GnbMenu
        role={role}
        items={isLoggedIn ? undefined : LOGOUT_NAV}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        footer={
          isLoggedIn ? undefined : (
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onLoginClick?.();
              }}
              className="text-16 text-black-500 flex w-full items-center overflow-hidden px-5 py-6 text-left font-medium"
            >
              로그인
            </button>
          )
        }
      />
    </>
  );
}

interface LogoLinkProps {
  iconOnlyOnMobile?: boolean;
}

function LogoSm({ className }: { className?: string }) {
  return (
    <Image
      src={logoSm}
      alt="무빙"
      width={88}
      height={34}
      className={clsx("h-8.5 w-22 max-w-none", className)}
      priority
    />
  );
}

function LogoLink({ iconOnlyOnMobile = false }: LogoLinkProps) {
  return (
    <Link href="/" aria-label="무빙 홈" className="relative shrink-0">
      {iconOnlyOnMobile ? (
        <>
          <span className="tablet:hidden block h-8.5 w-8 overflow-hidden">
            <LogoSm />
          </span>
          <span className="tablet:block pc:hidden hidden">
            <LogoSm />
          </span>
        </>
      ) : (
        <span className="pc:hidden block">
          <LogoSm />
        </span>
      )}
      <Image
        src={logoLg}
        alt="무빙"
        width={116}
        height={44}
        className="pc:block hidden h-11 w-29"
        priority
      />
    </Link>
  );
}
