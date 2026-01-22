'use client';

import { Message, Crew } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  crewName?: string;
  crews?: Crew[];
  onOptimize?: (messageId: string) => void;
}

export default function MessageBubble({ message, crewName, crews = [], onOptimize }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  // 크루 정보 찾기: 메시지에 포함된 crew 정보 또는 crews 배열에서 찾기
  let crew = message.crew;
  if (!crew && message.crewId && crews.length > 0) {
    crew = crews.find(c => c.id === message.crewId);
  }
  
  const displayName = isUser ? 'Me' : (crew?.name || crewName || '그룹');
  const avatarUrl = isUser ? null : (crew?.avatarUrl || null);
  const [showOptimize, setShowOptimize] = useState(false);

  // 멘션된 크루 이름 강조 표시
  const renderContentWithMentions = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts: Array<{ text: string; isMention: boolean }> = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // 멘션 전 텍스트
      if (match.index > lastIndex) {
        parts.push({
          text: content.substring(lastIndex, match.index),
          isMention: false,
        });
      }
      // 멘션 텍스트
      parts.push({
        text: match[0], // @크루이름
        isMention: true,
      });
      lastIndex = match.index + match[0].length;
    }

    // 남은 텍스트
    if (lastIndex < content.length) {
      parts.push({
        text: content.substring(lastIndex),
        isMention: false,
      });
    }

    if (parts.length === 0) {
      return content;
    }

    return (
      <>
        {parts.map((part, index) =>
          part.isMention ? (
            <span
              key={index}
              className={`font-semibold ${
                isUser ? 'text-blue-200' : 'text-blue-600'
              }`}
            >
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        )}
      </>
    );
  };

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
      onMouseEnter={() => !isUser && setShowOptimize(true)}
      onMouseLeave={() => setShowOptimize(false)}
    >
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
            <Image
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="text-xs font-medium text-gray-700">{displayName}</div>
          <div className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          {!isUser && showOptimize && onOptimize && (
            <button
              onClick={() => onOptimize(message.id)}
              className="text-xs text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Optimize Instructions
            </button>
          )}
        </div>
        <div
          className={`rounded-lg px-3 py-2 max-w-[70%] ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <div className="whitespace-pre-wrap break-words text-sm">
            {renderContentWithMentions(message.content)}
          </div>
        </div>
      </div>
    </div>
  );
}