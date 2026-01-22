'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crew } from '@/types';
import Sidebar from '@/components/layout/Sidebar';
import CrewGrid from '@/components/crew/CrewGrid';
import CrewModal from '@/components/crew/CrewModal';

export default function CrewPage() {
  const router = useRouter();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCrews();
  }, []);

  const loadCrews = async () => {
    try {
      const response = await fetch('/api/crew');
      const data = await response.json();
      setCrews(data.crews || []);
    } catch (error) {
      console.error('크루 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCrew = () => {
    setEditingCrew(null);
    setIsModalOpen(true);
  };

  const handleEditCrew = (crew: Crew) => {
    setEditingCrew(crew);
    setIsModalOpen(true);
  };

  const handleSaveCrew = async (data: { name: string; role: string; instructions: string }) => {
    try {
      if (editingCrew) {
        const response = await fetch(`/api/crew/${editingCrew.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('수정 실패');
      } else {
        const response = await fetch('/api/crew', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Creation failed');
      }
      await loadCrews();
    } catch (error) {
      console.error('크루 저장 오류:', error);
      throw error;
    }
  };

  const handleDeleteCrew = async (id: string) => {
    try {
      const response = await fetch(`/api/crew/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      await loadCrews();
    } catch (error) {
      console.error('Crew delete error:', error);
      alert('An error occurred while deleting.');
    }
  };

  const handleCrewClick = (crew: Crew) => {
    router.push(`/chat/${crew.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#fafafa]">
        <Sidebar crews={crews} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <Sidebar crews={crews} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200/50 bg-white px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
          <p className="text-sm text-gray-600 mt-1">Add crew members and optimize prompts</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <CrewGrid
              crews={crews}
              onCrewClick={handleCrewClick}
              onCrewDelete={handleDeleteCrew}
              onCrewEdit={handleEditCrew}
              onAddClick={handleAddCrew}
            />
          </div>
        </div>
      </div>

      <CrewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCrew(null);
        }}
        onSave={handleSaveCrew}
        crew={editingCrew}
      />
    </div>
  );
}