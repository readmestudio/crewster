'use client';

import { useState } from 'react';
import { Template } from '@/components/crew/TemplateCard';
import { generateAvatarUrl } from '@/lib/avatar';

interface HireCardProps {
  template: Template;
  onHire: (template: Template) => Promise<void>;
  onDetail: (template: Template) => void;
}

export default function HireCard({ template, onHire, onDetail }: HireCardProps) {
  const [isHiring, setIsHiring] = useState(false);
  const avatarUrl = generateAvatarUrl(template.name);

  const handleHire = async () => {
    setIsHiring(true);
    try {
      await onHire(template);
    } catch (error) {
      console.error('Hire failed:', error);
      alert('크루 영입에 실패했습니다.');
    } finally {
      setIsHiring(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-cream overflow-hidden flex items-center justify-center flex-shrink-0 border border-subtle-gray">
          <img
            src={avatarUrl}
            alt={template.name}
            className="w-full h-full object-contain p-1"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{template.iconEmoji}</span>
            <h3 className="text-h3 text-text-primary truncate">{template.name}</h3>
          </div>
          <p className="text-caption text-text-secondary">{template.role}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-caption text-text-secondary mb-5">
        {template.description}
      </p>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onDetail(template)}
          className="flex-1 px-4 py-2.5 border border-subtle-gray text-text-secondary hover:bg-hover-gray text-sm font-medium rounded-full transition-all"
        >
          자세히 보기
        </button>
        <button
          onClick={handleHire}
          disabled={isHiring}
          className="flex-1 px-4 py-2.5 bg-lime hover:bg-lime-hover text-text-primary text-sm font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isHiring ? '영입 중...' : 'Hire'}
        </button>
      </div>
    </div>
  );
}
