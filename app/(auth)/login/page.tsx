'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthMode = 'login' | 'register';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleKakaoLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || `${window.location.origin}/api/auth/kakao`;
    const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    window.location.href = kakaoUrl;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, nickname: nickname || undefined };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || '오류가 발생했습니다.');
        return;
      }

      // 로그인/회원가입 성공
      router.push('/crew');
    } catch (err) {
      setErrorMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Crewster
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI 크루 팀을 구축하세요
          </p>
        </div>

        {/* 탭 전환 */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 에러 메시지 */}
        {(error || errorMessage) && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {errorMessage || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'}
            </p>
          </div>
        )}

        {/* 이메일 폼 */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="6자 이상"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                닉네임 (선택)
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="표시될 이름"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? '처리 중...'
              : mode === 'login'
              ? '로그인'
              : '회원가입'}
          </button>
        </form>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">또는</span>
          </div>
        </div>

        {/* 카카오 로그인 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-yellow-400 px-4 py-3 font-medium text-gray-900 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
          </svg>
          카카오톡으로 {mode === 'login' ? '로그인' : '시작하기'}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>로딩 중...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
