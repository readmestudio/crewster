'use client';

import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportViewProps {
  report: any;
  reportData: any;
}

export default function ReportView({ report, reportData }: ReportViewProps) {
  const chartData = reportData.emotionChanges.map((change: any) => ({
    date: format(new Date(change.date), 'MM/dd'),
    intensity: change.intensity,
    emotion: change.emotion,
  }));

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

        {/* 감정 변화 그래프 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 border-l-4 border-yellow-400 pl-4">
            감정 변화 그래프
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="intensity"
                  stroke="#facc15"
                  strokeWidth={2}
                  dot={{ fill: '#facc15', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 주요 감정 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 border-l-4 border-yellow-400 pl-4">
            주요 감정
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {reportData.mainEmotions.map((item: any, index: number) => (
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

        {/* 핵심 믿음 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 border-l-4 border-yellow-400 pl-4">
            핵심 믿음
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              {reportData.hotThoughts && reportData.hotThoughts.length > 0 ? (
                reportData.hotThoughts.map((thought: string, index: number) => (
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
      </div>
    </div>
  );
}
