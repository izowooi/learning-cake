import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Keep',
  description: '친구들과 메모를 공유하세요.',
  openGraph: {
    title: 'Keep',
    description: '친구들과 메모를 공유하세요.',
    type: 'website',
  },
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
