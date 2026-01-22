'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crew } from '@/types';
import Sidebar from '@/components/layout/Sidebar';

export default function GroupPage() {
  const router = useRouter();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrewIds, setSelectedCrewIds] = useState<Set<string>>(new Set());

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

  const handleToggleCrewSelection = (crewId: string) => {
    setSelectedCrewIds((prev) => {
      const next = new Set(prev);
      if (next.has(crewId)) {
        next.delete(crewId);
      } else {
        next.add(crewId);
      }
      return next;
    });
  };

  const handleCreateGroupChat = async () => {
    if (selectedCrewIds.size < 2) {
      alert('Please select at least 2 crew members.');
      return;
    }

    try {
      const response = await fetch('/api/chat/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewIds: Array.from(selectedCrewIds),
          title: `${Array.from(selectedCrewIds)
            .map((id) => crews.find((c) => c.id === id)?.name)
            .filter(Boolean)
            .join(', ')} Group`,
        }),
      });

      if (!response.ok) throw new Error('그룹 생성 실패');

      const data = await response.json();
      router.push(`/chat/group/${data.session.id}`);
    } catch (error) {
      console.error('그룹 채팅 생성 오류:', error);
      alert('그룹 채팅 생성 중 오류가 발생했습니다.');
    }
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
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Group Chat</h1>
          <p className="text-sm text-gray-600 mt-1">Chat with multiple crew members</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {crews.length < 2 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">You need at least 2 crew members to create a group chat</p>
                <p className="text-sm text-gray-500">Add crew members from Home</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Select crew members for group ({selectedCrewIds.size} selected)
                  </h2>
                  <p className="text-sm text-gray-500">Select at least 2 members</p>
                </div>

                <div className="space-y-2 mb-6">
                  {crews.map((crew) => (
                    <label
                      key={crew.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedCrewIds.has(crew.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCrewIds.has(crew.id)}
                        onChange={() => handleToggleCrewSelection(crew.id)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                        {crew.avatarUrl ? (
                          <img
                            src={crew.avatarUrl}
                            alt={crew.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            {crew.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{crew.name}</h3>
                        <p className="text-sm text-gray-500">{crew.role}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleCreateGroupChat}
                  disabled={selectedCrewIds.size < 2}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  Start Group Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
