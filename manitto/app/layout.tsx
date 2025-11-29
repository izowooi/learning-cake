import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "마니또",
  description: "쉽고 재미있는 마니또 매칭 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[#fff5eb] to-[#fce8d5] dark:from-[var(--background)] dark:via-[#1f1a17] dark:to-[#251e1a]">
          <main className="container mx-auto px-4 py-8 max-w-lg">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
