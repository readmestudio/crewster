import { NextRequest, NextResponse } from 'next/server';
import { getKakaoToken, getKakaoUserInfo } from '@/lib/kakao';
import { generateToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=no_code', request.url)
    );
  }

  try {
    // 카카오톡 토큰 발급
    const tokenData = await getKakaoToken(code);
    
    // 카카오톡 사용자 정보 조회
    const userInfo = await getKakaoUserInfo(tokenData.access_token);
    
    const kakaoId = userInfo.id.toString();
    const nickname = userInfo.properties?.nickname || userInfo.kakao_account?.profile?.nickname || null;
    const email = userInfo.kakao_account?.email || null;

    // 사용자 조회 또는 생성
    let user = await prisma.user.findUnique({
      where: { kakaoId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          kakaoId,
          nickname,
          email,
        },
      });
    } else {
      // 사용자 정보 업데이트
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: nickname || user.nickname,
          email: email || user.email,
        },
      });
    }

    // JWT 토큰 생성
    const jwtToken = generateToken({
      userId: user.id,
      kakaoId: user.kakaoId,
    });

    // 쿠키에 토큰 저장
    const response = NextResponse.redirect(new URL('/chat', request.url));
    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return response;
  } catch (error) {
    console.error('Kakao auth error:', error);
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', request.url)
    );
  }
}
