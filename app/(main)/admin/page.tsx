'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nickname: string | null;
  email: string | null;
  createdAt: Date;
  _count: {
    dailyCheckIns: number;
    diaryEntries: number;
    reports: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [commentDate, setCommentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!selectedUser || !comment.trim()) {
      alert('사용자와 코멘트를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          date: commentDate,
          comment,
        }),
      });

      if (response.ok) {
        alert('코멘트가 저장되었습니다.');
        setComment('');
        setSelectedUser(null);
      } else {
        alert('코멘트 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">어드민 패널</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 사용자 목록 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">사용자 목록</h2>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedUser === user.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <p className="font-medium">
                    {user.nickname || `사용자 ${user.id.slice(0, 8)}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    체크인: {user._count.dailyCheckIns} | 일기: {user._count.diaryEntries} | 리포트: {user._count.reports}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 코멘트 작성 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">코멘트 작성</h2>
            {selectedUser ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={commentDate}
                    onChange={(e) => setCommentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    코멘트
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="상담사 코멘트를 입력하세요..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    rows={8}
                  />
                </div>
                <button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim()}
                  className="w-full rounded-lg bg-yellow-400 px-6 py-3 font-medium text-gray-900 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  저장하기
                </button>
              </div>
            ) : (
              <p className="text-gray-500">사용자를 선택해주세요.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
