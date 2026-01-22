'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatContainer from '@/components/chat/ChatContainer';
import { ChatMessage as ChatMessageType } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 인증 확인
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // AI 응답을 메시지에 추가
      const assistantMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatContainer
        initialMessages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
