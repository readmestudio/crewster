'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmotionChart from '@/components/my/EmotionChart';
import ThoughtList from '@/components/my/ThoughtList';
import { DailyCheckIn, DiaryEntry, Internalization } from '@/types';

export default function MyPage() {
  const router = useRouter();
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [internalizations, setInternalizations] = useState<Internalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 인증 확인
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          loadData();
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const loadData = async () => {
    try {
      const response = await fetch('/api/my/data?days=7');
      if (response.ok) {
        const data = await response.json();
        setCheckIns(data.checkIns || []);
        setDiaryEntries(data.diaryEntries || []);
        setInternalizations(data.internalizations || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">MY 페이지</h1>

        <EmotionChart checkIns={checkIns} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ThoughtList diaryEntries={diaryEntries} type="hot" />
          <ThoughtList diaryEntries={diaryEntries} type="balanced" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">내재화 문장</h3>
          {internalizations.length === 0 ? (
            <p className="text-gray-500">아직 기록이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {internalizations.map((item) => (
                <div
                  key={item.id}
                  className="border-l-4 border-yellow-400 pl-4 py-2"
                >
                  <p className="text-sm text-gray-500 mb-1">
                    {new Date(item.date).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-gray-800">{item.positiveStatement}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
