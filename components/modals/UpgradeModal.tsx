'use client';

import { useState } from 'react';
import { PLAN_CONFIG } from '@/lib/payment';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'crew' | 'message';
  currentUsage: number;
  limit: number;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  limitType,
  currentUsage,
  limit,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || '업그레이드 중 오류가 발생했습니다.');
        return;
      }

      if (data.url) {
        // 결제 페이지로 리다이렉트
        window.location.href = data.url;
      } else {
        setError('결제 기능이 곧 제공될 예정입니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const limitTypeText = limitType === 'crew' ? '크루 생성' : '메시지';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-text-primary">
            {limitTypeText} 한도 도달
          </h3>

          <p className="mt-2 text-sm text-text-secondary">
            Free 플랜의 {limitTypeText} 한도({currentUsage}/{limit})에 도달했습니다.
            <br />
            Pro로 업그레이드하면 무제한으로 사용할 수 있습니다.
          </p>

          {/* Pro Features */}
          <div className="mt-4 rounded-xl bg-lime/10 p-4">
            <h4 className="text-sm font-medium text-text-primary">
              {PLAN_CONFIG.pro.name} 플랜 (${PLAN_CONFIG.pro.price}/월)
            </h4>
            <ul className="mt-2 space-y-1 text-left text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                무제한 크루 생성
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                무제한 메시지
              </li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-subtle-gray px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-hover-gray transition-all"
            >
              나중에
            </button>
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="flex-1 rounded-full bg-lime px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-lime-hover disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            >
              {isLoading ? '처리 중...' : 'Pro 업그레이드'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
