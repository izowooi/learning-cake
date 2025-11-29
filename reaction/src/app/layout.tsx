import type { Metadata } from "next";
import { Inter, Orbitron, Nunito } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/contexts/GameContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "반응속도 테스트",
  description: "당신의 반응속도를 테스트해보세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} ${nunito.variable} antialiased`}
        data-theme="minimal"
      >
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
