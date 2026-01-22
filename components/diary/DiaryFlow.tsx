'use client';

import { useState } from 'react';
import EmotionCheckIn from './EmotionCheckIn';

interface DiaryFlowProps {
  onComplete: (data: {
    category: string;
    beforeThoughts: string;
    afterThoughts: string;
    hotThought: string;
    balancedThought: string;
  }) => void;
}

const CATEGORIES = [
  '관계', '업무', '건강', '재정', '성장', '여가', '기타'
];

const STEPS = {
  CHECKIN: 'checkin',
  CATEGORY: 'category',
  BEFORE: 'before',
  AFTER: 'after',
  INTERNALIZATION: 'internalization',
};

export default function DiaryFlow({ onComplete }: DiaryFlowProps) {
  const [step, setStep] = useState<string>(STEPS.CHECKIN);
  const [emotion, setEmotion] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(50);
  const [category, setCategory] = useState<string>('');
  const [beforeThoughts, setBeforeThoughts] = useState<string>('');
  const [afterThoughts, setAfterThoughts] = useState<string>('');
  const [hotThought, setHotThought] = useState<string>('');
  const [balancedThought, setBalancedThought] = useState<string>('');

  const handleCheckInComplete = (emotion: string, intensity: number, memo?: string) => {
    setEmotion(emotion);
    setIntensity(intensity);
    setStep(STEPS.CATEGORY);
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setStep(STEPS.BEFORE);
  };

  const handleBeforeComplete = () => {
    // Before에서 뜨거운 생각 추출 (간단히 동일하게 설정, 실제로는 AI가 추출)
    setHotThought(beforeThoughts);
    setStep(STEPS.AFTER);
  };

  const handleAfterComplete = () => {
    // After에서 균형잡힌 사고 추출
    setBalancedThought(afterThoughts);
    onComplete({
      category,
      beforeThoughts,
      afterThoughts,
      hotThought,
      balancedThought,
    });
  };

  if (step === STEPS.CHECKIN) {
    return <EmotionCheckIn onComplete={handleCheckInComplete} />;
  }

  if (step === STEPS.CATEGORY) {
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">카테고리 선택</h2>
        <p className="text-gray-600">오늘의 일기 주제를 선택해주세요.</p>
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className="px-6 py-4 rounded-lg border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === STEPS.BEFORE) {
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">Before 기록</h2>
        <p className="text-gray-600">
          {category}에 대해 처음 떠오른 생각이나 감정을 자유롭게 적어보세요.
        </p>
        <textarea
          value={beforeThoughts}
          onChange={(e) => setBeforeThoughts(e.target.value)}
          placeholder="생각을 자유롭게 적어보세요..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows={8}
        />
        <button
          onClick={handleBeforeComplete}
          disabled={!beforeThoughts.trim()}
          className="w-full rounded-lg bg-yellow-400 px-6 py-3 font-medium text-gray-900 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          다음 단계
        </button>
      </div>
    );
  }

  if (step === STEPS.AFTER) {
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">After 기록</h2>
        <p className="text-gray-600">
          조금 더 회복지향적이고 균형잡힌 시각으로 생각을 전환해보세요.
        </p>
        <textarea
          value={afterThoughts}
          onChange={(e) => setAfterThoughts(e.target.value)}
          placeholder="균형잡힌 관점을 적어보세요..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows={8}
        />
        <button
          onClick={handleAfterComplete}
          disabled={!afterThoughts.trim()}
          className="w-full rounded-lg bg-yellow-400 px-6 py-3 font-medium text-gray-900 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          완료
        </button>
      </div>
    );
  }

  return null;
}
