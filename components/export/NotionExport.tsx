'use client';

import { useState } from 'react';
import { copyMarkdownToClipboard } from '@/lib/notion';

interface NotionExportProps {
  title: string;
  content: string;
}

export default function NotionExport({ title, content }: NotionExportProps) {
  const [apiKey, setApiKey] = useState('');
  const [parentPageId, setParentPageId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);

  const handleCopyMarkdown = async () => {
    const markdown = `# ${title}\n\n${content}`;
    const success = await copyMarkdownToClipboard(markdown);
    if (success) {
      alert('마크다운이 클립보드에 복사되었습니다!');
    } else {
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  const handleExportToNotion = async () => {
    if (!apiKey) {
      alert('노션 API 키를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/notion/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          apiKey,
          parentPageId: parentPageId || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, url: data.url });
        alert('노션에 성공적으로 내보냈습니다!');
      } else {
        setResult({ success: false, error: data.error });
        alert(`내보내기 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('노션 내보내기 오류:', error);
      setResult({ success: false, error: '내보내기 중 오류가 발생했습니다.' });
      alert('내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="text-base font-semibold text-gray-900">노션으로 내보내기</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          노션 API 키 *
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="secret_..."
          className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          노션 통합에서 생성한 API 키를 입력하세요
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          부모 페이지 ID (선택)
        </label>
        <input
          type="text"
          value={parentPageId}
          onChange={(e) => setParentPageId(e.target.value)}
          placeholder="페이지 ID (선택사항)"
          className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          특정 페이지 하위에 생성하려면 페이지 ID를 입력하세요
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopyMarkdown}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
        >
          마크다운 복사
        </button>
        <button
          onClick={handleExportToNotion}
          disabled={isLoading || !apiKey}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? '내보내는 중...' : '노션으로 내보내기'}
        </button>
      </div>

      {result?.success && result.url && (
        <div className="text-sm text-green-600">
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline">
            노션 페이지 열기
          </a>
        </div>
      )}
    </div>
  );
}