'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleKakaoLogin = () => {
    const kakaoLoginUrl = `/api/auth/kakao/login-url`;
    // 서버에서 로그인 URL을 가져오거나 직접 생성
    const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || `${window.location.origin}/api/auth/kakao`;
    const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    window.location.href = kakaoUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            일기 앱 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            카카오톡으로 로그인하세요
          </p>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              로그인 중 오류가 발생했습니다. 다시 시도해주세요.
            </p>
          </div>
        )}
        <button
          onClick={handleKakaoLogin}
          className="w-full rounded-md bg-yellow-400 px-4 py-3 text-center font-medium text-gray-900 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          카카오톡으로 로그인
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
