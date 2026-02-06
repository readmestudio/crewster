import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nickname } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // Password length validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with free subscription
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: nickname || email.split('@')[0],
        subscription: {
          create: {
            plan: 'free',
            status: 'active',
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      authProvider: 'email',
    });

    // Set cookie and return response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
