'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Crew } from '@/types';

export default function SettingsPage() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [crewsRes, keyRes, meRes] = await Promise.all([
        fetch('/api/crew'),
        fetch('/api/settings/api-key'),
        fetch('/api/auth/me'),
      ]);

      const crewsData = await crewsRes.json();
      setCrews(crewsData.crews || []);

      const keyData = await keyRes.json();
      setHasApiKey(keyData.hasApiKey);
      setMaskedKey(keyData.maskedKey);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUserNickname(meData.user?.nickname);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '저장 중 오류가 발생했습니다.');
        return;
      }

      setSuccess('API 키가 저장되었습니다.');
      setApiKey('');
      setShowForm(false);
      await loadData();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('API 키를 삭제하시겠습니까? AI 기능을 사용할 수 없게 됩니다.')) return;

    try {
      await fetch('/api/settings/api-key', { method: 'DELETE' });
      setSuccess('API 키가 삭제되었습니다.');
      await loadData();
    } catch {
      setError('삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-cream">
        <Sidebar crews={crews} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin" />
            <span className="text-text-secondary">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cream">
      <Sidebar crews={crews} userNickname={userNickname || undefined} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-cream px-10 py-8 border-b border-subtle-gray">
          <h1 className="text-h1 font-display text-text-primary">Settings</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="max-w-2xl">
            {/* API Key Section */}
            <section className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-h3 text-text-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Gemini API Key
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Google Gemini AI를 사용하기 위한 API 키를 관리합니다.
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  hasApiKey
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                  {hasApiKey ? 'Connected' : 'Not Connected'}
                </div>
              </div>

              {/* Current Key Display */}
              {hasApiKey && maskedKey && (
                <div className="flex items-center gap-3 p-3 bg-hover-gray rounded-xl mb-4">
                  <code className="flex-1 text-sm text-text-secondary font-mono">{maskedKey}</code>
                  <button
                    onClick={handleDelete}
                    className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}

              {/* Success/Error Messages */}
              {success && (
                <div className="rounded-xl bg-green-50 p-3 mb-4">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}
              {error && (
                <div className="rounded-xl bg-red-50 p-3 mb-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Form */}
              {showForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      {hasApiKey ? '새 API Key' : 'API Key'}
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Google AI Studio에서 발급받은 키"
                        className="w-full px-4 py-3 pr-12 border border-subtle-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent bg-white text-text-primary placeholder:text-text-secondary/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      >
                        {showKey ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setApiKey('');
                        setError(null);
                      }}
                      className="flex-1 px-4 py-2.5 border border-subtle-gray rounded-full text-sm font-medium text-text-secondary hover:bg-hover-gray transition-all"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !apiKey.trim()}
                      className="flex-1 px-4 py-2.5 bg-lime hover:bg-lime-hover text-text-primary text-sm font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                          검증 중...
                        </span>
                      ) : (
                        '검증 후 저장'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full px-4 py-2.5 bg-lime hover:bg-lime-hover text-text-primary text-sm font-medium rounded-full transition-all"
                >
                  {hasApiKey ? 'API Key 변경' : 'API Key 등록'}
                </button>
              )}

              {/* Help Link */}
              <div className="mt-4 pt-4 border-t border-subtle-gray">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Google AI Studio에서 API Key 발급받기
                </a>
              </div>
            </section>

            {/* Account Info Section */}
            <section className="bg-white rounded-2xl p-6 shadow-card mt-6">
              <h2 className="text-h3 text-text-primary mb-4">Account</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-text-secondary">Nickname</span>
                  <span className="text-sm text-text-primary font-medium">{userNickname || '-'}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
