'use client';

import { Template } from '@/components/crew/TemplateCard';
import { generateAvatarUrl } from '@/lib/avatar';

interface HireDetailModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onHire: (template: Template) => Promise<void>;
}

interface ParsedInstructions {
  intro: string;
  specialties: string[];
  communicationStyle: string;
  priorities: string;
}

function parseInstructions(instructions: string): ParsedInstructions {
  const lines = instructions.split('\n');
  const result: ParsedInstructions = {
    intro: '',
    specialties: [],
    communicationStyle: '',
    priorities: '',
  };

  let currentSection: 'intro' | 'specialties' | 'communication' | 'priorities' = 'intro';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('전문 분야:')) {
      currentSection = 'specialties';
      continue;
    }
    if (trimmed.startsWith('커뮤니케이션 스타일:')) {
      currentSection = 'communication';
      const after = trimmed.replace('커뮤니케이션 스타일:', '').trim();
      if (after) result.communicationStyle = after;
      continue;
    }
    if (trimmed.startsWith('우선순위:')) {
      currentSection = 'priorities';
      const after = trimmed.replace('우선순위:', '').trim();
      if (after) result.priorities = after;
      continue;
    }

    switch (currentSection) {
      case 'intro':
        if (result.intro) {
          result.intro += ' ' + trimmed;
        } else {
          result.intro = trimmed;
        }
        break;
      case 'specialties':
        if (trimmed.startsWith('-')) {
          result.specialties.push(trimmed.slice(1).trim());
        }
        break;
      case 'communication':
        if (result.communicationStyle) {
          result.communicationStyle += ' ' + trimmed;
        } else {
          result.communicationStyle = trimmed;
        }
        break;
      case 'priorities':
        if (result.priorities) {
          result.priorities += ' ' + trimmed;
        } else {
          result.priorities = trimmed;
        }
        break;
    }
  }

  return result;
}

export default function HireDetailModal({ template, isOpen, onClose, onHire }: HireDetailModalProps) {
  if (!isOpen || !template) return null;

  const avatarUrl = generateAvatarUrl(template.name);
  const parsed = parseInstructions(template.instructions);

  const handleHire = async () => {
    await onHire(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-subtle-gray">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-cream overflow-hidden flex items-center justify-center flex-shrink-0 border border-subtle-gray">
              <img
                src={avatarUrl}
                alt={template.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{template.iconEmoji}</span>
                <h2 className="text-h2 text-text-primary">{template.name}</h2>
              </div>
              <p className="text-body text-text-secondary">{template.role}</p>
            </div>
          </div>
          {parsed.intro && (
            <p className="mt-4 text-body text-text-secondary">{parsed.intro}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 전문 분야 */}
          {parsed.specialties.length > 0 && (
            <div>
              <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                전문 분야
              </h3>
              <ul className="space-y-2">
                {parsed.specialties.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-caption text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 커뮤니케이션 스타일 */}
          {parsed.communicationStyle && (
            <div>
              <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">💬</span>
                커뮤니케이션 스타일
              </h3>
              <p className="text-caption text-text-secondary bg-hover-gray rounded-xl p-4">
                {parsed.communicationStyle}
              </p>
            </div>
          )}

          {/* 우선순위 */}
          {parsed.priorities && (
            <div>
              <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">⚡</span>
                우선순위
              </h3>
              <p className="text-caption text-text-secondary bg-hover-gray rounded-xl p-4">
                {parsed.priorities}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-subtle-gray flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 border border-subtle-gray text-text-secondary hover:bg-hover-gray text-sm font-medium rounded-full transition-all"
          >
            닫기
          </button>
          <button
            onClick={handleHire}
            className="flex-1 px-5 py-2.5 bg-lime hover:bg-lime-hover text-text-primary text-sm font-medium rounded-full transition-all"
          >
            Hire
          </button>
        </div>
      </div>
    </div>
  );
}
