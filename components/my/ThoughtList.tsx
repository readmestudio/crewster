'use client';

import { DiaryEntry } from '@/types';
import { format } from 'date-fns';

interface ThoughtListProps {
  diaryEntries: DiaryEntry[];
  type: 'hot' | 'balanced';
}

export default function ThoughtList({ diaryEntries, type }: ThoughtListProps) {
  const thoughts = diaryEntries
    .filter((entry) => (type === 'hot' ? entry.hotThought : entry.balancedThought))
    .map((entry) => ({
      date: entry.date,
      thought: type === 'hot' ? entry.hotThought : entry.balancedThought,
    }));

  if (thoughts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {type === 'hot' ? '뜨거운 생각' : '균형잡힌 사고'}
        </h3>
        <p className="text-gray-500">아직 기록이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        {type === 'hot' ? '뜨거운 생각' : '균형잡힌 사고'}
      </h3>
      <div className="space-y-4">
        {thoughts.map((item, index) => (
          <div key={index} className="border-l-4 border-yellow-400 pl-4 py-2">
            <p className="text-sm text-gray-500 mb-1">
              {format(new Date(item.date), 'yyyy년 MM월 dd일')}
            </p>
            <p className="text-gray-800">{item.thought}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
