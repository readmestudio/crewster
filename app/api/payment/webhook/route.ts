import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 결제 Webhook 이벤트 처리
// TODO: NICE Pay 연동 후 실제 시그니처 검증 구현

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature header' },
        { status: 400 }
      );
    }

    // TODO: NICE Pay 웹훅 시그니처 검증
    // const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    // verifySignature(body, signature, secret);

    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // 이벤트 타입에 따른 처리
    switch (event.type) {
      case 'payment.completed': {
        // 결제 완료 — Pro 업그레이드
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan: 'pro',
              status: 'active',
              paymentCustomerId: session.customer,
              paymentSubscriptionId: session.subscription,
              currentPeriodStart: new Date(),
            },
            create: {
              userId,
              plan: 'pro',
              status: 'active',
              paymentCustomerId: session.customer,
              paymentSubscriptionId: session.subscription,
            },
          });
          console.log('Pro upgrade completed for user:', userId);
        }
        break;
      }

      case 'subscription.updated': {
        // 구독 업데이트 (갱신, 플랜 변경 등)
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const existingSub = await prisma.subscription.findFirst({
          where: { paymentCustomerId: customerId },
        });

        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              status: subscription.status === 'active' ? 'active' : 'past_due',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
          console.log('Subscription updated for customer:', customerId);
        }
        break;
      }

      case 'subscription.canceled': {
        // 구독 취소/만료
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const existingSub = await prisma.subscription.findFirst({
          where: { paymentCustomerId: customerId },
        });

        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              plan: 'free',
              status: 'canceled',
              paymentSubscriptionId: null,
            },
          });
          console.log('Subscription canceled for customer:', customerId);
        }
        break;
      }

      case 'payment.failed': {
        // 결제 실패
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const existingSub = await prisma.subscription.findFirst({
          where: { paymentCustomerId: customerId },
        });

        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: { status: 'past_due' },
          });
          console.log('Payment failed for customer:', customerId);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
