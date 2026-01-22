'use client';

import { Crew } from '@/types';
import CrewCard from './CrewCard';
import CrewAddCard from './CrewAddCard';

interface CrewGridProps {
  crews: Crew[];
  onCrewClick: (crew: Crew) => void;
  onCrewDelete: (id: string) => void;
  onCrewEdit: (crew: Crew) => void;
  onAddClick: () => void;
}

export default function CrewGrid({ crews, onCrewClick, onCrewDelete, onCrewEdit, onAddClick }: CrewGridProps) {
  return (
    <div className="space-y-6">
      {/* Add 크루 카드 - 위에 작게 */}
      <div className="flex justify-start">
        <CrewAddCard onClick={onAddClick} />
      </div>
      
      {/* 크루 카드들 - 2x2 그리드 */}
      <div className="grid grid-cols-2 gap-6">
        {crews.map((crew) => (
          <CrewCard
            key={crew.id}
            crew={crew}
            onClick={() => onCrewClick(crew)}
            onDelete={onCrewDelete}
            onEdit={() => onCrewEdit(crew)}
          />
        ))}
      </div>
    </div>
  );
}