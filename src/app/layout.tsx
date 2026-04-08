import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

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
      <body className="min-h-full flex flex-col bg-black">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
