'use client';

import { useState, useEffect } from 'react';

interface InternalizationProps {
  afterThoughts: string;
  onComplete: (statement: string) => void;
}

export default function Internalization({
  afterThoughts,
  onComplete,
}: InternalizationProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedStatement, setSelectedStatement] = useState<string>('');
  const [customStatement, setCustomStatement] = useState<string>('');

  useEffect(() => {
    // After 생각에서 긍정 구문 추출 (간단한 예시, 실제로는 AI가 추출)
    const sentences = afterThoughts.split(/[.!?。]/).filter((s) => s.trim().length > 10);
    setSuggestions(sentences.slice(0, 3));
  }, [afterThoughts]);

  const handleSelect = (statement: string) => {
    setSelectedStatement(statement);
    setCustomStatement(statement);
  };

  const handleSubmit = () => {
    if (customStatement.trim()) {
      onComplete(customStatement.trim());
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">내재화</h2>
      <p className="text-gray-600">
        After에서 나온 새로운 관점을 선택하거나 수정하여 나의 긍정 구문으로 만들어보세요.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          추천 문장
        </label>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                selectedStatement === suggestion
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          나의 긍정 구문
        </label>
        <textarea
          value={customStatement}
          onChange={(e) => setCustomStatement(e.target.value)}
          placeholder="문장을 선택하거나 직접 수정해보세요..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows={4}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!customStatement.trim()}
        className="w-full rounded-lg bg-yellow-400 px-6 py-3 font-medium text-gray-900 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        저장하기
      </button>
    </div>
  );
}
