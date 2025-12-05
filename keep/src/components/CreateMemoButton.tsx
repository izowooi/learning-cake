'use client';

interface CreateMemoButtonProps {
  onClick: () => void;
}

export default function CreateMemoButton({ onClick }: CreateMemoButtonProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-300 p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <span className="text-gray-500">메모 작성...</span>
    </div>
  );
}
