'use client';

import { useState } from 'react';

interface UsageData {
  crews: {
    used: number;
    limit: number;
  };
  messages: {
    used: number;
    limit: number;
  };
}

interface UsageBadgeProps {
  usage: UsageData;
  plan: 'free' | 'pro';
  onUpgradeClick?: () => void;
}

export default function UsageBadge({ usage, plan, onUpgradeClick }: UsageBadgeProps) {
  const formatLimit = (limit: number) => (limit === -1 ? '무제한' : limit);
  const isUnlimited = (limit: number) => limit === -1;

  const crewPercentage = isUnlimited(usage.crews.limit)
    ? 0
    : (usage.crews.used / usage.crews.limit) * 100;
  const messagePercentage = isUnlimited(usage.messages.limit)
    ? 0
    : (usage.messages.used / usage.messages.limit) * 100;

  const isCrewWarning = crewPercentage >= 80;
  const isMessageWarning = messagePercentage >= 80;

  return (
    <div className="rounded-lg bg-white border border-gray-200 p-3 space-y-3">
      {/* Plan Badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            plan === 'pro'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {plan === 'pro' ? 'Pro' : 'Free'}
        </span>
        {plan === 'free' && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            업그레이드
          </button>
        )}
      </div>

      {/* Usage Stats */}
      <div className="space-y-2">
        {/* Crews */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">크루</span>
            <span className={isCrewWarning ? 'text-orange-600 font-medium' : 'text-gray-900'}>
              {usage.crews.used}/{formatLimit(usage.crews.limit)}
            </span>
          </div>
          {!isUnlimited(usage.crews.limit) && (
            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isCrewWarning ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(crewPercentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Messages */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">메시지 (월간)</span>
            <span className={isMessageWarning ? 'text-orange-600 font-medium' : 'text-gray-900'}>
              {usage.messages.used}/{formatLimit(usage.messages.limit)}
            </span>
          </div>
          {!isUnlimited(usage.messages.limit) && (
            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isMessageWarning ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(messagePercentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
