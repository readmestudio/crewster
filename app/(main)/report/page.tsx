'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

interface ReportData {
  checkIns: any[];
  diaryEntries: any[];
  emotions: any[];
  emotionChanges: any[];
  mainEmotions: { emotion: string; count: number }[];
  hotThoughts: string[];
  totalDays: number;
}

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');

  const [report, setReport] = useState<any>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 인증 확인
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          if (reportId) {
            loadReport(reportId);
          }
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router, reportId]);

  const loadReport = async (id: string) => {
    try {
      const response = await fetch(`/api/report?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
        setReportData(data.reportData);
      }
    } catch (error) {
      console.error('Failed to load report:', error);
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

  if (!report || !reportData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>리포트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* 리포트 헤더 */}
        <div className="text-center mb-12 border-b-2 border-gray-200 pb-8">
          <h1 className="text-4xl font-bold mb-4">7일 일기 리포트</h1>
          <p className="text-gray-600">
            {format(new Date(report.startDate), 'yyyy년 MM월 dd일')} ~{' '}
            {format(new Date(report.endDate), 'yyyy년 MM월 dd일')}
          </p>
        </div>

        {/* 주요 감정 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 border-l-4 border-yellow-400 pl-4">
            주요 감정
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {reportData.mainEmotions.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 text-center"
              >
                <p className="text-3xl font-bold text-yellow-400 mb-2">
                  {item.count}
                </p>
                <p className="text-gray-700">{item.emotion}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 감정 변화 추이 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 border-l-4 border-yellow-400 pl-4">
            감정 변화 추이
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              {reportData.emotionChanges.map((change: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {format(new Date(change.date), 'MM월 dd일')}
                    </p>
                    <p className="text-sm text-gray-600">{change.emotion}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{change.intensity}%</p>
                    {change.change !== 0 && (
                      <p
                        className={`text-sm ${
                          change.change > 0 ? 'text-red-500' : 'text-blue-500'
                        }`}
                      >
                        {change.change > 0 ? '+' : ''}
                        {change.change}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 핵심 믿음 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 border-l-4 border-yellow-400 pl-4">
            핵심 믿음
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              {reportData.hotThoughts.length > 0 ? (
                reportData.hotThoughts.map((thought, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-yellow-400 pl-4 py-2"
                  >
                    <p className="text-gray-800">{thought}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">기록된 핵심 믿음이 없습니다.</p>
              )}
            </div>
          </div>
        </section>

        {/* 상담사 코멘트 */}
        {report.counselorComment && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 border-l-4 border-purple-400 pl-4">
              상담사 코멘트
            </h2>
            <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-400">
              <p className="text-gray-800 whitespace-pre-wrap">
                {report.counselorComment}
              </p>
            </div>
          </section>
        )}

        {/* 리포트 요약 */}
        <section className="mt-12 pt-8 border-t-2 border-gray-200">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {reportData.totalDays}
              </p>
              <p className="text-gray-600">총 일수</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {reportData.checkIns.length}
              </p>
              <p className="text-gray-600">감정 체크인</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {reportData.diaryEntries.length}
              </p>
              <p className="text-gray-600">일기 작성</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
