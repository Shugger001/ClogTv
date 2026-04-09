import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "CLOG TV World Platform",
  description:
    "Premium global news and entertainment platform with realtime newsroom workflows.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/clog-logo.png",
    shortcut: "/clog-logo.png",
    apple: "/clog-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black pb-20 md:pb-0">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="flex-1">
          <AppProviders>{children}</AppProviders>
        </div>
        <MobileTabBar />
        <SiteFooter />
      </body>
    </html>
  );
}
