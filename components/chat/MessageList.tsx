'use client';

import { Message, Crew } from '@/types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  crewName?: string;
  crews?: Crew[];
  onOptimize?: (messageId: string) => void;
}

export default function MessageList({ messages, crewName, crews = [], onOptimize }: MessageListProps) {
  if (messages.length === 0) {
    const displayName = crewName || '그룹';
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">대화를 시작하세요</p>
          <p className="text-sm">{displayName}와(과) 대화를 나눠보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        // 메시지에 crew 정보가 없으면 crews 배열에서 찾기
        let crew = message.crew;
        if (!crew && message.crewId && crews.length > 0) {
          crew = crews.find(c => c.id === message.crewId) || undefined;
        }
        
        return (
          <MessageBubble
            key={message.id}
            message={{ ...message, crew }}
            crewName={crewName}
            crews={crews}
            onOptimize={onOptimize}
          />
        );
      })}
    </div>
  );
}