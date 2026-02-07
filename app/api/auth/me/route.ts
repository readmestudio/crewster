import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { getCurrentUsage } from '@/lib/usage';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        kakaoId: true,
        nickname: true,
        email: true,
        geminiApiKey: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get usage stats
    const usage = await getCurrentUsage(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        kakaoId: user.kakaoId,
        hasGeminiKey: !!user.geminiApiKey,
        createdAt: user.createdAt,
      },
      subscription: user.subscription || {
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
      },
      usage,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
