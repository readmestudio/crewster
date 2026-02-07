// 슬라이딩 윈도우 카운터 기반 요청 속도 제한
// - 이전 윈도우의 가중 카운트를 반영하여 경계 시점 burst 방지
// - Cloudflare, Nginx 등에서 사용하는 동일 알고리즘

import { NextRequest, NextResponse } from 'next/server';

interface WindowEntry {
  currentCount: number;
  previousCount: number;
  windowStart: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
}

class SlidingWindowCounter {
  private windows = new Map<string, WindowEntry>();
  private limit: number;
  private windowMs: number;
  private checkCount = 0;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    this.checkCount++;

    // 매 100번째 호출마다 stale 엔트리 정리
    if (this.checkCount % 100 === 0) {
      this.cleanup(now);
    }

    let entry = this.windows.get(key);

    if (!entry) {
      entry = { currentCount: 0, previousCount: 0, windowStart: now };
      this.windows.set(key, entry);
    }

    // 윈도우 회전: 현재 윈도우가 만료되었으면 이전으로 이동
    const elapsed = now - entry.windowStart;
    if (elapsed >= this.windowMs) {
      // 2개 윈도우 이상 지났으면 이전 카운트도 0
      if (elapsed >= this.windowMs * 2) {
        entry.previousCount = 0;
      } else {
        entry.previousCount = entry.currentCount;
      }
      entry.currentCount = 0;
      entry.windowStart = now - (elapsed % this.windowMs);
    }

    // 슬라이딩 윈도우 가중 카운트 계산
    const elapsedInWindow = now - entry.windowStart;
    const previousWeight = 1 - elapsedInWindow / this.windowMs;
    const weightedCount =
      entry.previousCount * previousWeight + entry.currentCount;

    if (weightedCount >= this.limit) {
      // 다음 윈도우까지 남은 시간 계산
      const retryAfterMs = this.windowMs - elapsedInWindow;
      return {
        allowed: false,
        limit: this.limit,
        remaining: 0,
        retryAfterSec: Math.ceil(retryAfterMs / 1000),
      };
    }

    entry.currentCount++;

    return {
      allowed: true,
      limit: this.limit,
      remaining: Math.max(
        0,
        Math.floor(this.limit - weightedCount - 1)
      ),
      retryAfterSec: 0,
    };
  }

  private cleanup(now: number): void {
    const maxAge = this.windowMs * 2;
    for (const [key, entry] of this.windows) {
      if (now - entry.windowStart > maxAge) {
        this.windows.delete(key);
      }
    }
  }
}

// --- Tier별 Rate Limiter 인스턴스 ---

const limiters = {
  general: new SlidingWindowCounter(60, 60 * 1000),   // 60회 / 1분
  ai: new SlidingWindowCounter(5, 60 * 1000),          // 5회 / 1분
  login: new SlidingWindowCounter(5, 5 * 60 * 1000),   // 5회 / 5분
} as const;

export type RateLimitTier = keyof typeof limiters;

// --- IP 추출 ---

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

// --- Rate Limit 미들웨어 ---

/**
 * 요청 속도 제한 체크.
 * - 허용 시 `null` 반환 (기존 미들웨어 패턴과 동일)
 * - 거부 시 429 NextResponse 반환
 */
export function rateLimit(
  request: NextRequest,
  tier: RateLimitTier = 'general'
): NextResponse | null {
  const ip = getClientIp(request);
  const limiter = limiters[tier];
  const result = limiter.check(`${tier}:${ip}`);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        code: 'RATE_LIMITED',
        retryAfter: result.retryAfterSec,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfterSec),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null;
}
