'use client';

import { Message, Thread } from '@/types';
import MessageBubble from './MessageBubble';

interface ThreadViewProps {
  thread: Thread;
  messages: Message[];
  crews: Array<{ id: string; name: string; avatarUrl: string | null }>;
}

export default function ThreadView({ thread, messages, crews }: ThreadViewProps) {
  const threadMessages = messages.filter((m) => m.id === thread.parentMessageId || m.metadata?.includes(thread.id));

  return (
    <div className="border-l-4 border-blue-500 pl-4 ml-4 my-4">
      <div className="text-sm text-gray-400 mb-2">
        {thread.title || '쓰레드'}
      </div>
      <div className="space-y-2">
        {threadMessages.map((message) => {
          const crew = crews.find((c) => c.id === message.crewId);
          return (
            <MessageBubble
              key={message.id}
              message={message}
              crewName={crew?.name || '알 수 없음'}
            />
          );
        })}
      </div>
    </div>
  );
}