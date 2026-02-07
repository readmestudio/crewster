import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { encryptApiKey, decryptApiKey, maskApiKey } from '@/lib/crypto';
import { validateGeminiApiKey } from '@/lib/gemini';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { geminiApiKey: true },
  });

  return NextResponse.json({
    hasApiKey: !!user?.geminiApiKey,
    maskedKey: user?.geminiApiKey
      ? maskApiKey(decryptApiKey(user.geminiApiKey))
      : null,
  });
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { apiKey } = await request.json();

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return NextResponse.json(
      { error: 'API 키를 입력해주세요.' },
      { status: 400 }
    );
  }

  const isValid = await validateGeminiApiKey(apiKey.trim());
  if (!isValid) {
    return NextResponse.json(
      { error: 'API 키가 유효하지 않습니다. Google AI Studio에서 올바른 키를 확인하세요.' },
      { status: 400 }
    );
  }

  const encrypted = encryptApiKey(apiKey.trim());
  await prisma.user.update({
    where: { id: auth.userId },
    data: { geminiApiKey: encrypted },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: auth.userId },
    data: { geminiApiKey: null },
  });

  return NextResponse.json({ success: true });
}
