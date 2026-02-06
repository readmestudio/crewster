import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { prisma } from './db';
import { checkLimit, logUsage } from './usage';
import { decryptApiKey } from './crypto';

export interface AuthContext extends JWTPayload {
  subscription: {
    plan: 'free' | 'pro';
    status: string;
  };
}

export async function requireAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function requireAuthWithSubscription(
  request: NextRequest
): Promise<AuthContext | null> {
  const auth = await requireAuth(request);
  if (!auth) return null;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: auth.userId },
  });

  return {
    ...auth,
    subscription: {
      plan: (subscription?.plan as 'free' | 'pro') || 'free',
      status: subscription?.status || 'active',
    },
  };
}

export type UsageAction = 'crew_create' | 'message_send';

export async function withUsageLimit(
  request: NextRequest,
  action: UsageAction
): Promise<{ auth: AuthContext; error?: NextResponse } | null> {
  const auth = await requireAuthWithSubscription(request);
  if (!auth) return null;

  const limitCheck = await checkLimit(auth.userId, action);
  if (!limitCheck.allowed) {
    return {
      auth,
      error: NextResponse.json(
        {
          error: limitCheck.error,
          code: 'LIMIT_EXCEEDED',
          current: limitCheck.current,
          limit: limitCheck.limit,
        },
        { status: 403 }
      ),
    };
  }

  return { auth };
}

export async function logUsageAndRespond(
  userId: string,
  type: string
): Promise<void> {
  await logUsage(userId, type);
}

export function createUnauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function createLimitExceededResponse(message: string) {
  return NextResponse.json(
    { error: message, code: 'LIMIT_EXCEEDED' },
    { status: 403 }
  );
}

export async function requireAuthWithApiKey(
  request: NextRequest
): Promise<{ auth: AuthContext; apiKey: string } | { auth: AuthContext; error: NextResponse } | null> {
  const auth = await requireAuthWithSubscription(request);
  if (!auth) return null;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { geminiApiKey: true },
  });

  if (!user?.geminiApiKey) {
    return {
      auth,
      error: NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다. 설정에서 API 키를 추가하세요.', code: 'NO_API_KEY' },
        { status: 400 }
      ),
    };
  }

  try {
    const apiKey = decryptApiKey(user.geminiApiKey);
    return { auth, apiKey };
  } catch {
    return {
      auth,
      error: NextResponse.json(
        { error: 'API 키 처리 중 오류가 발생했습니다. 설정에서 API 키를 다시 등록하세요.', code: 'INVALID_API_KEY' },
        { status: 500 }
      ),
    };
  }
}
