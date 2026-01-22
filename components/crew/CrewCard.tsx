'use client';

import { Crew } from '@/types';

interface CrewCardProps {
  crew: Crew;
  onClick: () => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export default function CrewCard({ crew, onClick, onDelete, onEdit }: CrewCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${crew.name}?`)) {
      onDelete(crew.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <div
      className="group relative bg-white border border-gray-200/50 rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all hover:border-gray-300 flex flex-col min-h-[320px]"
      onClick={onClick}
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
        <button
          onClick={handleEdit}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Avatar at top */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
          {crew.avatarUrl ? (
            <img
              src={crew.avatarUrl}
              alt={crew.name}
              className="w-full h-full"
              style={{ objectFit: 'contain', padding: '12px' }}
            />
          ) : (
            <div className="text-2xl text-gray-400">
              {crew.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">{crew.name}</h3>
        <p className="text-sm text-gray-600 mb-2 text-center">{crew.role}</p>
        <p className="text-xs text-gray-500 text-center line-clamp-2 px-2">
          {getTaskSummary(crew.instructions)}
        </p>
      </div>
    </div>
  );
}

// 프롬프트에서 하는 일을 한 줄로 요약하는 함수
function getTaskSummary(instructions: string): string {
  if (!instructions) return '';
  
  // 첫 문장 추출 (마침표, 줄바꿈, 또는 100자까지)
  const firstSentence = instructions
    .split(/[.\n]/)[0]
    .trim()
    .substring(0, 100);
  
  // 너무 짧으면 다음 문장도 포함
  if (firstSentence.length < 30 && instructions.length > firstSentence.length) {
    const secondPart = instructions
      .substring(firstSentence.length)
      .split(/[.\n]/)[0]
      .trim()
      .substring(0, 70);
    return firstSentence + (secondPart ? ' ' + secondPart : '');
  }
  
  return firstSentence || instructions.substring(0, 100);
}