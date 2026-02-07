'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import UsageBadge from '@/components/usage/UsageBadge';
import UpgradeModal from '@/components/modals/UpgradeModal';

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

interface SidebarProps {
  crews?: Array<{ id: string; name: string; avatarUrl: string | null }>;
  usage?: UsageData;
  plan?: 'free' | 'pro';
  userNickname?: string;
  hasGeminiKey?: boolean;
}

export default function Sidebar({ crews = [], usage, plan = 'free', userNickname, hasGeminiKey }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/crew') {
      return pathname === '/crew' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      href: '/crew',
      label: 'Crew',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/dm',
      label: 'Duet Mode',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
    },
    {
      href: '/group',
      label: 'Orchestra Mode',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-60 bg-white border-r border-subtle-gray flex flex-col h-screen">
      {/* Logo Header */}
      <div className="p-5 border-b border-subtle-gray">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image src="/logo.png" alt="Crewster" width={28} height={28} quality={100} priority />
          </div>
          <h1 className="text-xl font-semibold text-text-primary font-display tracking-tight">Crewster</h1>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(item.href)
                ? 'bg-lime text-text-primary font-semibold'
                : 'text-text-secondary hover:bg-hover-gray'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Direct Messages Section */}
        {crews.length > 0 && (
          <>
            <div className="pt-6 pb-2">
              <h3 className="px-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Recent Chats
              </h3>
            </div>
            {crews.slice(0, 5).map((crew) => (
              <Link
                key={crew.id}
                href={`/chat/${crew.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  pathname === `/chat/${crew.id}`
                    ? 'bg-lime text-text-primary font-medium'
                    : 'text-text-secondary hover:bg-hover-gray'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-subtle-gray flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {crew.avatarUrl ? (
                    <img
                      src={crew.avatarUrl}
                      alt={crew.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-text-secondary">
                      {crew.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="truncate">{crew.name}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-subtle-gray p-3 space-y-2">
        {/* Settings */}
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isActive('/settings')
              ? 'bg-lime text-text-primary font-semibold'
              : 'text-text-secondary hover:bg-hover-gray'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
          {hasGeminiKey === false && (
            <span className="ml-auto w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="API Key 미설정" />
          )}
        </Link>

        {/* Upgrade Pro Button */}
        {plan === 'free' && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full bg-lime hover:bg-lime-hover text-text-primary text-sm font-medium transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span>Upgrade Pro</span>
          </button>
        )}

        {/* Usage Badge */}
        {usage && (
          <UsageBadge
            usage={usage}
            plan={plan}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        )}

        {/* User Info & Logout */}
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-subtle-gray flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-text-secondary">
                {userNickname?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm text-text-secondary truncate">
              {userNickname || 'User'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
            title="Logout"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="crew"
        currentUsage={usage?.crews.used || 0}
        limit={usage?.crews.limit || 3}
      />
    </div>
  );
}
