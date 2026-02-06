// Stripe 클라이언트 초기화 및 설정
// TODO: 실제 Stripe 결제 연동 시 구현

// 환경 변수
// STRIPE_SECRET_KEY - Stripe 시크릿 키
// STRIPE_PUBLISHABLE_KEY - Stripe 퍼블릭 키
// STRIPE_WEBHOOK_SECRET - Stripe 웹훅 시크릿

// Pro 플랜 가격 ID (Stripe 대시보드에서 생성)
export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_xxx',
} as const;

// Stripe 클라이언트 초기화 (나중에 구현)
// import Stripe from 'stripe';
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// });

// Checkout 세션 생성 (스텁)
export async function createCheckoutSession(
  userId: string,
  email: string
): Promise<{ url: string | null }> {
  // TODO: Stripe Checkout 세션 생성
  // const session = await stripe.checkout.sessions.create({
  //   customer_email: email,
  //   line_items: [{ price: STRIPE_PRICE_IDS.pro_monthly, quantity: 1 }],
  //   mode: 'subscription',
  //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=success`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=cancel`,
  //   metadata: { userId },
  // });
  // return { url: session.url };

  console.log('TODO: Implement Stripe checkout for user:', userId);
  return { url: null };
}

// 구독 취소 (스텁)
export async function cancelSubscription(
  stripeSubscriptionId: string
): Promise<{ success: boolean }> {
  // TODO: Stripe 구독 취소
  // await stripe.subscriptions.cancel(stripeSubscriptionId);

  console.log('TODO: Implement subscription cancellation:', stripeSubscriptionId);
  return { success: false };
}

// 고객 포털 세션 생성 (스텁)
export async function createPortalSession(
  stripeCustomerId: string
): Promise<{ url: string | null }> {
  // TODO: Stripe 고객 포털 세션 생성
  // const session = await stripe.billingPortal.sessions.create({
  //   customer: stripeCustomerId,
  //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  // });
  // return { url: session.url };

  console.log('TODO: Implement portal session for customer:', stripeCustomerId);
  return { url: null };
}
