import { prisma } from './db';
import { TTLCache } from './cache';

export const PLAN_LIMITS = {
  free: {
    maxCrews: 3,
    maxMessagesPerMonth: 100,
  },
  pro: {
    maxCrews: Infinity,
    maxMessagesPerMonth: Infinity,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type UsageType = 'crew_create' | 'message_send';

export interface UsageStats {
  crews: {
    used: number;
    limit: number;
  };
  messages: {
    used: number;
    limit: number;
  };
}

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  error?: string;
}

const usageCountCache = new TTLCache<number>(10 * 60 * 1000);

function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getUsageCacheKey(userId: string, action: UsageType): string {
  const monthStart = getMonthStart();
  return `${userId}:${action}:${monthStart.getTime()}`;
}

export async function getCurrentUsage(userId: string): Promise<UsageStats> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = (subscription?.plan as PlanType) || 'free';
  const limits = PLAN_LIMITS[plan];

  // Count crews
  const crewCount = await prisma.crew.count({
    where: { userId },
  });

  // Count messages this month
  const monthStart = getMonthStart();
  const messageCount = await prisma.usageLog.count({
    where: {
      userId,
      type: 'message_send',
      createdAt: { gte: monthStart },
    },
  });

  return {
    crews: {
      used: crewCount,
      limit: limits.maxCrews === Infinity ? -1 : limits.maxCrews,
    },
    messages: {
      used: messageCount,
      limit: limits.maxMessagesPerMonth === Infinity ? -1 : limits.maxMessagesPerMonth,
    },
  };
}

export async function checkLimit(
  userId: string,
  action: UsageType
): Promise<LimitCheckResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = (subscription?.plan as PlanType) || 'free';
  return checkLimitWithPlan(userId, action, plan);
}

export async function checkLimitWithPlan(
  userId: string,
  action: UsageType,
  plan: PlanType
): Promise<LimitCheckResult> {
  const limits = PLAN_LIMITS[plan];

  if (action === 'crew_create') {
    const limit = limits.maxCrews;
    if (limit === Infinity) {
      return { allowed: true, current: 0, limit: Infinity };
    }

    const crewCount = await prisma.crew.count({
      where: { userId },
    });

    if (crewCount >= limit) {
      return {
        allowed: false,
        current: crewCount,
        limit,
        error: `크루 생성 한도에 도달했습니다. (${crewCount}/${limit}) Pro로 업그레이드하면 무제한 크루를 생성할 수 있습니다.`,
      };
    }

    return { allowed: true, current: crewCount, limit };
  }

  if (action === 'message_send') {
    const limit = limits.maxMessagesPerMonth;
    if (limit === Infinity) {
      return { allowed: true, current: 0, limit: Infinity };
    }

    // Check cache first
    const cacheKey = getUsageCacheKey(userId, action);
    let messageCount = usageCountCache.get(cacheKey);

    if (messageCount === undefined) {
      const monthStart = getMonthStart();
      messageCount = await prisma.usageLog.count({
        where: {
          userId,
          type: 'message_send',
          createdAt: { gte: monthStart },
        },
      });
      usageCountCache.set(cacheKey, messageCount);
    }

    if (messageCount >= limit) {
      return {
        allowed: false,
        current: messageCount,
        limit,
        error: `월간 메시지 한도에 도달했습니다. (${messageCount}/${limit}) Pro로 업그레이드하면 무제한 메시지를 보낼 수 있습니다.`,
      };
    }

    return { allowed: true, current: messageCount, limit };
  }

  return { allowed: true, current: 0, limit: Infinity };
}

export async function logUsage(userId: string, type: string): Promise<void> {
  await prisma.usageLog.create({
    data: {
      userId,
      type,
    },
  });

  // Increment cached count if present
  const cacheKey = getUsageCacheKey(userId, type as UsageType);
  const cached = usageCountCache.get(cacheKey);
  if (cached !== undefined) {
    usageCountCache.set(cacheKey, cached + 1);
  }
}
