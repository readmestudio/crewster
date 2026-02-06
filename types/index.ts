export interface User {
  id: string;
  email: string | null;
  password?: string;  // Excluded from client responses
  kakaoId: string | null;
  nickname: string | null;
  hasGeminiKey?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanType = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageLimit {
  used: number;
  limit: number;  // -1 means unlimited
}

export interface Usage {
  crews: UsageLimit;
  messages: UsageLimit;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    nickname: string | null;
    kakaoId: string | null;
    createdAt: Date;
  };
  subscription: {
    plan: PlanType;
    status: SubscriptionStatus;
    currentPeriodEnd: Date | null;
  };
  usage: Usage;
}

// AI 크루 팀 구축 플랫폼 타입
export interface Crew {
  id: string;
  name: string;
  role: string;
  instructions: string;
  avatarUrl: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  type: 'direct' | 'group';
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  crewMembers?: Crew[];
}

export interface Message {
  id: string;
  sessionId: string;
  crewId: string | null;
  content: string;
  role: 'user' | 'assistant' | 'system';
  metadata: string | null;
  createdAt: Date;
  crew?: Crew | null;
}

export interface Thread {
  id: string;
  sessionId: string;
  parentMessageId: string | null;
  title: string | null;
  createdAt: Date;
}

export interface Optimization {
  id: string;
  crewId: string;
  previousInstructions: string;
  newInstructions: string;
  reason: string | null;
  createdAt: Date;
}
