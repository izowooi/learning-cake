import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Keep - 메모 공유',
  description: '친구들과 메모를 공유하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
