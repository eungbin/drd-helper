import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRD Helper",
  description: "드래곤볼 운빨 디펜스 조합 계산기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
