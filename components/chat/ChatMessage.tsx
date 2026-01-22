'use client';

import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isCounselor = message.role === 'counselor';

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-yellow-400 text-gray-900'
            : isCounselor
            ? 'bg-purple-100 text-gray-900'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p className="text-xs mt-1 opacity-60">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
