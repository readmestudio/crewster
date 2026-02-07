'use client';

import { Crew } from '@/types';

interface CrewCardProps {
  crew: Crew;
  onClick: () => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  isNew?: boolean;
}

export default function CrewCard({ crew, onClick, onDelete, onEdit, isNew }: CrewCardProps) {
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
      className="group relative bg-white rounded-2xl p-6 cursor-pointer shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col min-h-[200px]"
      onClick={onClick}
    >
      {/* Action buttons */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
        <button
          onClick={handleEdit}
          className="p-1.5 rounded-lg hover:bg-hover-gray text-text-secondary hover:text-text-primary transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg hover:bg-hover-gray text-text-secondary hover:text-red-500 transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-cream overflow-hidden flex items-center justify-center flex-shrink-0 border border-subtle-gray">
          {crew.avatarUrl ? (
            <img
              src={crew.avatarUrl}
              alt={crew.name}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <span className="text-xl text-text-secondary">
              {crew.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-h3 text-text-primary truncate">{crew.name}</h3>
          <p className="text-caption text-text-secondary">{crew.role}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-caption text-text-secondary line-clamp-2 flex-1">
        {crew.description || getTaskSummary(crew.instructions)}
      </p>

      {/* New crew hint or Chat indicator */}
      {isNew ? (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-subtle-gray">
          <span className="text-caption text-lime-hover font-medium">
            ✏️ 수정 버튼을 눌러 지침을 업데이트하세요
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-subtle-gray">
          <div className="w-2 h-2 rounded-full bg-mint"></div>
          <span className="text-caption text-text-secondary">Click to chat</span>
        </div>
      )}
    </div>
  );
}

function getTaskSummary(instructions: string): string {
  if (!instructions) return '';

  const firstSentence = instructions
    .split(/[.\n]/)[0]
    .trim()
    .substring(0, 100);

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
