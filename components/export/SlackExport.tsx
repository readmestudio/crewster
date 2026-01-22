'use client';

import { useState } from 'react';

interface SlackExportProps {
  content: string;
}

export default function SlackExport({ content }: SlackExportProps) {
  const [token, setToken] = useState('');
  const [channel, setChannel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleSendToSlack = async () => {
    if (!token || !channel) {
      alert('슬랙 봇 토큰과 채널을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/slack/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          text: content,
          token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true });
        alert('슬랙에 성공적으로 전송했습니다!');
      } else {
        setResult({ success: false, error: data.error });
        alert(`전송 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('슬랙 전송 오류:', error);
      setResult({ success: false, error: '전송 중 오류가 발생했습니다.' });
      alert('전송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="text-base font-semibold text-gray-900">슬랙으로 전송</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          슬랙 봇 토큰 *
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="xoxb-..."
          className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Slack App의 Bot User OAuth Token을 입력하세요
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          채널 ID 또는 이름 *
        </label>
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="#general 또는 C1234567890"
          className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          채널 이름(#general) 또는 채널 ID를 입력하세요
        </p>
      </div>

      <button
        onClick={handleSendToSlack}
        disabled={isLoading || !token || !channel}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isLoading ? '전송 중...' : '슬랙으로 전송'}
      </button>

      {result?.success && (
        <div className="text-sm text-green-600">전송 완료!</div>
      )}
    </div>
  );
}