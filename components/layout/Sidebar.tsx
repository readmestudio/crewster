'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  crews?: Array<{ id: string; name: string; avatarUrl: string | null }>;
}

export default function Sidebar({ crews = [] }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/crew') {
      return pathname === '/crew' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-[#fafafa] border-r border-gray-200/50 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Crewster</h1>
        <p className="text-xs text-gray-500 mt-1">Build your own Avengers team</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <Link
          href="/crew"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            isActive('/crew')
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-700 hover:bg-white/50'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Home</span>
        </Link>

        <Link
          href="/dm"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/dm')
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>DMs</span>
        </Link>

        <Link
          href="/group"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive('/group')
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Chat</span>
        </Link>

        {/* Direct Messages Section */}
        {crews.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase">
                Direct messages
              </h3>
            </div>
            {crews.map((crew) => (
              <Link
                key={crew.id}
                href={`/chat/${crew.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  pathname === `/chat/${crew.id}`
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  {crew.avatarUrl ? (
                    <img
                      src={crew.avatarUrl}
                      alt={crew.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      {crew.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="truncate">{crew.name}</span>
              </Link>
            ))}
          </>
        )}
      </nav>
    </div>
  );
}
