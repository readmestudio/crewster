import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAuthWithSubscription,
  createUnauthorizedResponse,
  invalidateSubscriptionCache,
} from '@/lib/middleware';
import {
  createCheckoutSession,
  cancelSubscription,
} from '@/lib/payment';
import { rateLimit } from '@/lib/rate-limit';

// GET: 현재 구독 상태 조회
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const subscription = await prisma.subscription.findUnique({
      where: { userId: auth.userId },
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: {
          plan: 'free',
          status: 'active',
          currentPeriodEnd: null,
        },
      });
    }

    return NextResponse.json({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        paymentCustomerId: subscription.paymentCustomerId,
        paymentSubscriptionId: subscription.paymentSubscriptionId,
      },
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: '구독 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: Pro 업그레이드 (결제 세션 생성)
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    // 이미 Pro 사용자인지 확인
    if (auth.subscription.plan === 'pro') {
      return NextResponse.json(
        { error: '이미 Pro 플랜을 사용 중입니다.' },
        { status: 400 }
      );
    }

    // 사용자 이메일 조회
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: '이메일이 설정되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 결제 세션 생성 (TODO: NICE Pay 연동)
    const { url } = await createCheckoutSession(auth.userId, user.email);

    if (!url) {
      return NextResponse.json(
        {
          error: '결제 기능이 곧 제공될 예정입니다.',
          message: 'Pro 업그레이드는 곧 제공될 예정입니다.',
        },
        { status: 501 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json(
      { error: '업그레이드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 구독 취소
export async function DELETE(request: NextRequest) {
  try {
    const limited = rateLimit(request);
    if (limited) return limited;

    const auth = await requireAuthWithSubscription(request);
    if (!auth) return createUnauthorizedResponse();

    const subscription = await prisma.subscription.findUnique({
      where: { userId: auth.userId },
    });

    if (!subscription || subscription.plan !== 'pro') {
      return NextResponse.json(
        { error: '취소할 Pro 구독이 없습니다.' },
        { status: 400 }
      );
    }

    if (!subscription.paymentSubscriptionId) {
      return NextResponse.json(
        {
          error: '결제 구독 정보가 없습니다.',
          message: '고객센터에 문의해주세요.',
        },
        { status: 400 }
      );
    }

    // 구독 취소 (TODO: NICE Pay 연동)
    const { success } = await cancelSubscription(subscription.paymentSubscriptionId);

    if (!success) {
      return NextResponse.json(
        {
          error: '결제 기능이 곧 제공될 예정입니다.',
        },
        { status: 501 }
      );
    }

    // 구독 상태 업데이트
    await prisma.subscription.update({
      where: { userId: auth.userId },
      data: { status: 'canceled' },
    });

    invalidateSubscriptionCache(auth.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json(
      { error: '구독 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
