'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crew } from '@/types';
import Sidebar from '@/components/layout/Sidebar';

export default function DMPage() {
  const router = useRouter();
  const [crews, setCrews] = useState<Crew[]>([]);
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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white">
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
          <h1 className="text-2xl font-semibold text-gray-900">Direct Messages</h1>
          <p className="text-sm text-gray-600 mt-1">Start a 1:1 conversation with your crew</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {crews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">No crew members yet</p>
                <p className="text-sm text-gray-500">Add crew members from Home</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {crews.map((crew) => (
                  <button
                    key={crew.id}
                    onClick={() => router.push(`/chat/${crew.id}`)}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                      {crew.avatarUrl ? (
                        <img
                          src={crew.avatarUrl}
                          alt={crew.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg text-gray-500">
                          {crew.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{crew.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{crew.role}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
