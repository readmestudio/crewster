// 크루 개별 조회, 수정, 삭제 API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAvatarUrl } from '@/lib/avatar';
import {
  requireAuthWithSubscription,
  createUnauthorizedResponse,
} from '@/lib/middleware';

// GET: 특정 크루 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const crew = await prisma.crew.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    });

    if (!crew) {
      return NextResponse.json(
        { error: 'Crew not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ crew });
  } catch (error) {
    console.error('Crew fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching crew.' },
      { status: 500 }
    );
  }
}

// PATCH: 크루 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const body = await request.json();
    const { name, role, instructions } = body;

    const crew = await prisma.crew.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    });

    if (!crew) {
      return NextResponse.json(
        { error: 'Crew not found.' },
        { status: 404 }
      );
    }

    // 이름이 변경되면 아바타도 재생성
    let avatarUrl = crew.avatarUrl;
    if (name && name !== crew.name) {
      avatarUrl = generateAvatarUrl(name);
    }

    const updatedCrew = await prisma.crew.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(instructions && { instructions }),
        ...(avatarUrl && { avatarUrl }),
      },
    });

    return NextResponse.json({ crew: updatedCrew });
  } catch (error) {
    console.error('Crew update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating crew.' },
      { status: 500 }
    );
  }
}

// DELETE: 크루 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const crew = await prisma.crew.findFirst({
      where: {
        id: params.id,
        userId: auth.userId,
      },
    });

    if (!crew) {
      return NextResponse.json(
        { error: 'Crew not found.' },
        { status: 404 }
      );
    }

    await prisma.crew.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Crew delete error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting crew.' },
      { status: 500 }
    );
  }
}