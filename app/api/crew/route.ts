// 크루 CRUD API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAvatarUrl } from '@/lib/avatar';
import {
  requireAuthWithSubscription,
  withUsageLimit,
  createUnauthorizedResponse,
  logUsageAndRespond,
} from '@/lib/middleware';
import { rateLimit } from '@/lib/rate-limit';

// GET: 모든 크루 조회
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const crews = await prisma.crew.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ crews });
  } catch (error) {
    console.error('Crew fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching crews.' },
      { status: 500 }
    );
  }
}

// POST: 새 크루 생성
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    // 인증 및 크루 생성 제한 확인
    const result = await withUsageLimit(request, 'crew_create');
    if (!result) return createUnauthorizedResponse();
    if (result.error) return result.error;

    const { auth } = result;

    // 요청 바디 파싱 (한 번만 읽을 수 있음)
    let body: { name?: string; role?: string; instructions?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const { name, role, instructions } = body;

    if (!name || !role || !instructions) {
      return NextResponse.json(
        { error: 'Name, role, and instructions are required.' },
        { status: 400 }
      );
    }

    // 사용자 존재 확인 및 구독 없으면 생성 (레거시 사용자 대응)
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { subscription: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign in again.' },
        { status: 404 }
      );
    }
    if (!user.subscription) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'free',
          status: 'active',
        },
      });
    }

    // 아바타 URL 생성
    const avatarUrl = generateAvatarUrl(name);

    const crew = await prisma.crew.create({
      data: {
        name,
        role,
        instructions,
        avatarUrl,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ crew }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const code = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : undefined;
    console.error('Crew creation error:', { message, code, error });

    // Prisma 외래키 등 제약 위반 시 클라이언트에 안내
    if (code === 'P2003') {
      return NextResponse.json(
        { error: 'User not found. Please sign in again.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while creating crew.' },
      { status: 500 }
    );
  }
}