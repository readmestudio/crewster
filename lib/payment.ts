// 결제 프로바이더에 독립적인 결제 인터페이스
// NICE Pay 연동 시 이 인터페이스를 구현하면 됨

// 가격 설정 (중앙화)
export const PLAN_CONFIG = {
  pro: {
    price: 9.9,
    currency: 'USD',
    interval: 'monthly' as const,
    name: 'Pro',
  },
} as const;

// 결제 프로바이더 인터페이스 (나이스페이 구현 시 이 인터페이스를 구현)
export interface PaymentProvider {
  createCheckoutSession(userId: string, email: string): Promise<{ url: string | null }>;
  cancelSubscription(subscriptionId: string): Promise<{ success: boolean }>;
}

// 현재: 스텁 구현 (나이스페이 연동 전)
export async function createCheckoutSession(
  userId: string,
  email: string
): Promise<{ url: string | null }> {
  console.log('TODO: NICE Pay 결제 세션 생성 — userId:', userId, 'email:', email);
  return { url: null };
}

export async function cancelSubscription(
  paymentSubscriptionId: string
): Promise<{ success: boolean }> {
  console.log('TODO: NICE Pay 구독 취소 — subscriptionId:', paymentSubscriptionId);
  return { success: false };
}
