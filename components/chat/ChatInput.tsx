'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Crew } from '@/types';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  crews?: Crew[];
}

export default function ChatInput({ onSend, disabled, crews = [] }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 멘션 가능한 크루 필터링
  const filteredCrews = crews.filter((crew) =>
    crew.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // @ 입력 감지 및 멘션 드롭다운 표시
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setMessage(value);

    // @ 입력 감지
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // 공백이나 @가 나오기 전까지의 텍스트
      const match = textAfterAt.match(/^(\w*)$/);
      
      if (match) {
        setMentionQuery(match[1]);
        setMentionIndex(lastAtIndex);
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }

    // 자동 높이 조절
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  // 크루 선택 시 @크루이름 삽입
  const handleSelectCrew = (crew: Crew) => {
    if (!textareaRef.current) return;

    const textBefore = message.substring(0, mentionIndex);
    const textAfter = message.substring(textareaRef.current.selectionStart);
    const newMessage = `${textBefore}@${crew.name} ${textAfter}`;

    setMessage(newMessage);
    setShowMentionDropdown(false);
    setMentionQuery('');
    setMentionIndex(-1);

    // 포커스 복원 및 커서 위치 조정
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionIndex + crew.name.length + 2; // @ + 이름 + 공백
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // 키보드로 드롭다운 네비게이션
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionDropdown && filteredCrews.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev < filteredCrews.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSelectCrew(filteredCrews[selectedMentionIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionDropdown(false);
        return;
      }
    }

    // 일반 Enter 처리
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !showMentionDropdown) {
      e.preventDefault();
      handleSend();
    }
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      setShowMentionDropdown(false);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white relative">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line, @ to mention)"
            className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-[200px] overflow-y-auto"
            rows={1}
            disabled={disabled}
          />
          
          {/* 멘션 드롭다운 */}
          {showMentionDropdown && filteredCrews.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute bottom-full left-0 mb-2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {filteredCrews.map((crew, index) => (
                <button
                  key={crew.id}
                  type="button"
                  onClick={() => handleSelectCrew(crew)}
                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 ${
                    index === selectedMentionIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                    {crew.avatarUrl ? (
                      <img
                        src={crew.avatarUrl}
                        alt={crew.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        {crew.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{crew.name}</div>
                    <div className="text-sm text-gray-500 truncate">{crew.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium h-fit"
        >
          {disabled ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}