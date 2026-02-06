'use client';

import { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ApiKeyModal from '@/components/modals/ApiKeyModal';
import { Message, Crew } from '@/types';

interface ChatContainerProps {
  crewId: string;
  crewName: string;
  crew?: Crew | null;
  initialMessages?: Message[];
  onOptimizeRequest?: (messageId: string) => void;
}

export default function ChatContainer({ crewId, crewName, crew, initialMessages = [], onOptimizeRequest }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOptimize = (messageId: string) => {
    if (onOptimizeRequest) {
      onOptimizeRequest(messageId);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      sessionId: '',
      crewId: null,
      content,
      role: 'user',
      metadata: null,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewId,
          content,
          sessionId: messages[0]?.sessionId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.code === 'NO_API_KEY' || errorData?.code === 'INVALID_API_KEY') {
          setShowApiKeyModal(true);
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          setIsLoading(false);
          return;
        }
        throw new Error(errorData?.error || 'Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('Unable to read stream');

      // 스트리밍 응답 처리
      let assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        sessionId: '',
        crewId,
        content: '',
        role: 'assistant',
        metadata: null,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (updated[lastIndex]?.id === assistantMessage.id) {
                    updated[lastIndex] = { ...assistantMessage };
                  }
                  return updated;
                });
              }
              if (parsed.sessionId) {
                assistantMessage.sessionId = parsed.sessionId;
              }
              if (parsed.messageId) {
                assistantMessage.id = parsed.messageId;
              }
            } catch (e) {
              // JSON 파싱 실패 시 무시
            }
          }
        }
      }
    } catch (error) {
      console.error('Message send error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sessionId: '',
          crewId: null,
          content: 'An error occurred while sending the message.',
          role: 'assistant',
          metadata: null,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} crewName={crewName} onOptimize={handleOptimize} />
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={() => setShowApiKeyModal(false)}
      />
    </div>
  );
}