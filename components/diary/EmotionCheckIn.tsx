'use client';

import { useState } from 'react';

interface EmotionCheckInProps {
  onComplete: (emotion: string, intensity: number, memo?: string) => void;
}

const EMOTIONS = [
  '기쁨', '슬픔', '분노', '불안', '놀람', '혐오', '평온', '설렘', '외로움', '만족'
];

export default function EmotionCheckIn({ onComplete }: EmotionCheckInProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(50);
  const [memo, setMemo] = useState<string>('');

  const handleSubmit = () => {
    if (selectedEmotion) {
      onComplete(selectedEmotion, intensity, memo);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">오늘의 감정 체크인</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          감정 선택
        </label>
        <div className="grid grid-cols-5 gap-2">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(emotion)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                selectedEmotion === emotion
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          강도: {intensity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>약함</span>
          <span>보통</span>
          <span>강함</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          메모 (선택)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="한 줄 메모를 남겨보세요..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows={2}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedEmotion}
        className="w-full rounded-lg bg-yellow-400 px-6 py-3 font-medium text-gray-900 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        완료
      </button>
    </div>
  );
}
