'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Crew, Message } from '@/types';
import Sidebar from '@/components/layout/Sidebar';
import ChatContainer from '@/components/chat/ChatContainer';
import NotionExport from '@/components/export/NotionExport';
import SlackExport from '@/components/export/SlackExport';
import OptimizeModal from '@/components/crew/OptimizeModal';
import CrewModal from '@/components/crew/CrewModal';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = params.crewId as string;
  
  const [crew, setCrew] = useState<Crew | null>(null);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [optimizeMessageId, setOptimizeMessageId] = useState<string | null>(null);

  useEffect(() => {
    loadCrew();
    loadMessages();
    loadCrews();
  }, [crewId]);

  const loadCrews = async () => {
    try {
      const response = await fetch('/api/crew');
      const data = await response.json();
      setCrews(data.crews || []);
    } catch (error) {
      console.error('크루 목록 로드 오류:', error);
    }
  };

  const loadCrew = async () => {
    try {
      const response = await fetch(`/api/crew/${crewId}`);
      const data = await response.json();
      setCrew(data.crew);
    } catch (error) {
      console.error('크루 로드 오류:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // 세션이 있으면 메시지 로드
      const response = await fetch(`/api/chat/session?crewId=${crewId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('메시지 로드 오류:', error);
    } finally {
      setIsLoading(false);
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

  if (!crew) {
    return (
      <div className="flex h-screen bg-[#fafafa]">
        <Sidebar crews={crews} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-900 mb-4">Crew not found</p>
            <button
              onClick={() => router.push('/crew')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOptimizeRequest = (messageId: string) => {
    setOptimizeMessageId(messageId);
    setIsOptimizeModalOpen(true);
  };

  const handleOptimizeComplete = (optimizedCrew: Crew) => {
    setCrew(optimizedCrew);
    // Reload crew data
    loadCrew();
  };

  const handleEditCrew = (crewToEdit: Crew) => {
    setEditingCrew(crewToEdit);
    setIsOptimizeModalOpen(false);
    setIsCrewModalOpen(true);
  };

  const handleSaveCrew = async (data: { name: string; role: string; instructions: string }) => {
    try {
      const response = await fetch(`/api/crew/${crew?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Update failed');
      const updated = await response.json();
      setCrew(updated.crew);
      setIsCrewModalOpen(false);
      setEditingCrew(null);
    } catch (error) {
      console.error('Crew save error:', error);
      throw error;
    }
  };

  const getConversationContext = () => {
    if (!optimizeMessageId) return '';
    const messageIndex = messages.findIndex(m => m.id === optimizeMessageId);
    if (messageIndex === -1) return '';
    const recentMessages = messages.slice(Math.max(0, messageIndex - 5), messageIndex + 1);
    return recentMessages
      .map((m) => `${m.role === 'user' ? 'User' : 'Crew'}: ${m.content}`)
      .join('\n\n');
  };

  const exportContent = messages
    .map((m) => {
      const sender = m.role === 'user' ? 'Me' : m.crew?.name || crew.name;
      return `**${sender}**: ${m.content}`;
    })
    .join('\n\n');

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <Sidebar crews={crews} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                {crew.avatarUrl ? (
                  <img
                    src={crew.avatarUrl}
                    alt={crew.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                    {crew.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{crew.name}</h1>
                <p className="text-xs text-gray-500">{crew.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                const modal = document.getElementById('export-modal') as HTMLDialogElement;
                modal?.showModal();
              }}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              Export
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatContainer 
            crewId={crewId} 
            crewName={crew.name} 
            crew={crew}
            initialMessages={messages}
            onOptimizeRequest={handleOptimizeRequest}
          />
        </div>
      </div>

      {/* 내보내기 모달 */}
      <dialog id="export-modal" className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Export</h2>
          <button
            onClick={() => {
              const modal = document.getElementById('export-modal') as HTMLDialogElement;
              modal?.close();
            }}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <NotionExport title={`Conversation with ${crew.name}`} content={exportContent} />
          <SlackExport content={exportContent} />
        </div>
      </dialog>

      {/* Optimize Modal */}
      <OptimizeModal
        isOpen={isOptimizeModalOpen}
        onClose={() => {
          setIsOptimizeModalOpen(false);
          setOptimizeMessageId(null);
        }}
        crew={crew}
        conversationContext={getConversationContext()}
        onOptimizeComplete={handleOptimizeComplete}
        onEditCrew={handleEditCrew}
      />

      {/* Crew Modal */}
      <CrewModal
        isOpen={isCrewModalOpen}
        onClose={() => {
          setIsCrewModalOpen(false);
          setEditingCrew(null);
        }}
        onSave={handleSaveCrew}
        crew={editingCrew}
      />
    </div>
  );
}