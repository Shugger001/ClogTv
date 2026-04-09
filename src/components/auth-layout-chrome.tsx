"use client";

import { usePathname } from "next/navigation";
import { MobileTabBar } from "@/components/mobile-tab-bar";

export function AuthLayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/auth") || pathname === "/unauthorized";

  return (
    <>
      <div className={hideChrome ? "flex-1" : "flex-1 pb-20 md:pb-0"}>{children}</div>
      {!hideChrome ? <MobileTabBar /> : null}
    </>
  );
}
