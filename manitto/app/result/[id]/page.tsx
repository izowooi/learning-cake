import ResultPageClient from '@/components/ResultPageClient';

// 정적 내보내기를 위한 빈 params 반환
export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  return <ResultPageClient groupId={id} />;
}

