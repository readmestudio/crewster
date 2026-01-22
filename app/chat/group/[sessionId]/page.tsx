'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Crew, Message, ChatSession } from '@/types';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';

export default function GroupChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [targetCrewId, setTargetCrewId] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
    loadMessages();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/chat/session?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        // 세션 정보는 별도로 로드 필요
        const sessionResponse = await fetch(`/api/chat/group/session/${sessionId}`);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSession(sessionData.session);
          setCrews(sessionData.session.crewMembers?.map((cm: any) => cm.crew) || []);
        }
      }
    } catch (error) {
      console.error('세션 로드 오류:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/session?sessionId=${sessionId}`);
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

  // 메시지에서 @멘션 파싱
  const parseMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];
    
    return matches.map(m => m.slice(1)); // @ 제거
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);

    // 멘션된 크루 이름 추출
    const mentionedNames = parseMentions(content);
    const mentionedCrewIds = crews
      .filter(crew => mentionedNames.includes(crew.name))
      .map(crew => crew.id);

    // 사용자 메시지 즉시 추가
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      sessionId,
      crewId: null,
      content,
      role: 'user',
      metadata: null,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat/group', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content,
          targetCrewId: mentionedCrewIds.length > 0 ? null : targetCrewId, // 멘션이 있으면 targetCrewId 무시
          mentionedCrewIds: mentionedCrewIds.length > 0 ? mentionedCrewIds : undefined,
        }),
      });

      if (!response.ok) throw new Error('메시지 전송 실패');

      const data = await response.json();

      // 응답 메시지 추가
      setMessages((prev) => [
        ...prev,
        ...data.assistantMessages.map((msg: Message) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        })),
      ]);

      setTargetCrewId(null);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      alert('메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">세션을 찾을 수 없습니다</p>
          <button
            onClick={() => router.push('/crew')}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            크루 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="border-b border-gray-700 p-4 bg-gray-800">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crew')}
              className="text-gray-400 hover:text-white"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{session.title || '그룹 채팅'}</h1>
              <p className="text-sm text-gray-400">
                {crews.length}명의 크루
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {crews.map((crew) => (
              <button
                key={crew.id}
                onClick={() => setTargetCrewId(targetCrewId === crew.id ? null : crew.id)}
                className={`px-3 py-1 rounded text-sm ${
                  targetCrewId === crew.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {crew.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-7xl mx-auto w-full">
        <MessageList
          messages={messages}
          crews={crews}
        />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isSending} crews={crews} />
    </div>
  );
}