import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ganttly - 팀 일정 관리',
  description: '팀원들의 업무 일정을 간트 차트로 시각화하여 관리하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
