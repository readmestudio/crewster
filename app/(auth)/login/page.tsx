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

      router.push('/crew');
    } catch {
      setErrorMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-card">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="Crewster" width={36} height={36} />
            </div>
            <h2 className="text-3xl font-bold text-text-primary font-display tracking-tight">
              Crewster
            </h2>
          </div>
          <p className="text-sm text-text-secondary">
            AI 크루 팀을 구축하세요
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex rounded-xl bg-hover-gray p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === 'register'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Error Message */}
        {(error || errorMessage) && (
          <div className="rounded-xl bg-red-50 p-3">
            <p className="text-sm text-red-800">
              {errorMessage || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'}
            </p>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-subtle-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent bg-white text-text-primary placeholder:text-text-secondary/50"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-subtle-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent bg-white text-text-primary placeholder:text-text-secondary/50"
              placeholder="6자 이상"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-text-primary mb-1.5">
                닉네임 (선택)
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 border border-subtle-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent bg-white text-text-primary placeholder:text-text-secondary/50"
                placeholder="표시될 이름"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-lime hover:bg-lime-hover text-text-primary font-medium rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                처리 중...
              </span>
            ) : (
              mode === 'login' ? '로그인' : '회원가입'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-subtle-gray" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-text-secondary">또는</span>
          </div>
        </div>

        {/* Kakao Login */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FEE500] px-4 py-3 font-medium text-[#191919] hover:bg-[#FDD835] transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
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
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin" />
          <span className="text-text-secondary">로딩 중...</span>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
