"use client";

import { type ReactNode } from "react";
import { useGuestGuard } from "@/hooks/use-guest-guard";

export default function CustomerAuthLayout({ children }: { children: ReactNode }) {
  const { isChecking } = useGuestGuard();

  if (isChecking) return null;

  return <div>{children}</div>;
}
