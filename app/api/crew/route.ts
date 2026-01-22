// 크루 CRUD API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAvatarUrl } from '@/lib/avatar';

// 로컬 스토리지 기반이므로 임시 userId 사용
const DEFAULT_USER_ID = 'local-user';

// GET: 모든 크루 조회
export async function GET(request: NextRequest) {
  try {
    const crews = await prisma.crew.findMany({
      where: {
        userId: DEFAULT_USER_ID,
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
    const body = await request.json();
    const { name, role, instructions } = body;

    if (!name || !role || !instructions) {
      return NextResponse.json(
        { error: 'Name, role, and instructions are required.' },
        { status: 400 }
      );
    }

    // 아바타 URL 생성
    const avatarUrl = generateAvatarUrl(name);

    const crew = await prisma.crew.create({
      data: {
        name,
        role,
        instructions,
        avatarUrl,
        userId: DEFAULT_USER_ID,
      },
    });

    return NextResponse.json({ crew }, { status: 201 });
  } catch (error) {
    console.error('Crew creation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating crew.' },
      { status: 500 }
    );
  }
}