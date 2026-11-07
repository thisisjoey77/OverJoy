import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DayQuid",
  description: "Daily spending tracker",
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
  },
};

export const viewport: Viewport = {
  themeColor: "#006040",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
