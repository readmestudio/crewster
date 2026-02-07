'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Crew } from '@/types';
import Sidebar from '@/components/layout/Sidebar';
import CrewCard from '@/components/crew/CrewCard';
import CrewModal from '@/components/crew/CrewModal';
import HireCard from '@/components/crew/HireCard';
import HireDetailModal from '@/components/crew/HireDetailModal';
import { Template } from '@/components/crew/TemplateCard';
import ApiKeyModal from '@/components/modals/ApiKeyModal';

type TabType = 'my-crew' | 'hire-me';

const HIRE_CATEGORY_ORDER = [
  { key: 'hire-engineering', label: '엔지니어링' },
  { key: 'hire-marketing', label: '마케팅' },
  { key: 'hire-content', label: '콘텐츠' },
  { key: 'hire-analytics', label: '분석' },
  { key: 'hire-business', label: '비즈니스' },
  { key: 'hire-operations', label: '운영' },
];

export default function CrewPage() {
  const router = useRouter();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [hireTemplates, setHireTemplates] = useState<Template[]>([]);
  const [generalTemplates, setGeneralTemplates] = useState<Template[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('my-crew');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [detailTemplate, setDetailTemplate] = useState<Template | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [hireSuccess, setHireSuccess] = useState<{ name: string } | null>(null);
  const [recentlyHiredIds, setRecentlyHiredIds] = useState<Set<string>>(new Set());

  // 카테고리별 그룹핑
  const groupedHireTemplates = useMemo(() => {
    const map = new Map<string, Template[]>();
    for (const t of hireTemplates) {
      const cat = t.category || 'hire-other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(t);
    }
    return map;
  }, [hireTemplates]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [crewsRes, templatesRes, meRes] = await Promise.all([
        fetch('/api/crew'),
        fetch('/api/template'),
        fetch('/api/auth/me'),
      ]);

      const crewsData = await crewsRes.json();
      const templatesData = await templatesRes.json();

      setCrews(crewsData.crews || []);

      const allTemplates: Template[] = templatesData.templates || [];
      setHireTemplates(allTemplates.filter((t) => t.category?.startsWith('hire-')));
      setGeneralTemplates(allTemplates.filter((t) => !t.category?.startsWith('hire-')));

      if (meRes.ok) {
        const meData = await meRes.json();
        const hasKey = meData.user?.hasGeminiKey ?? false;
        setHasGeminiKey(hasKey);
        setUserNickname(meData.user?.nickname || null);
        if (!hasKey) {
          setShowApiKeyModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCrew = () => {
    setEditingCrew(null);
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditCrew = (crew: Crew) => {
    setEditingCrew(crew);
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleSaveCrew = async (data: { name: string; role: string; instructions: string }) => {
    try {
      if (editingCrew) {
        const response = await fetch(`/api/crew/${editingCrew.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Update failed');
      } else {
        const response = await fetch('/api/crew', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Creation failed');
      }
      await loadData();
    } catch (error) {
      console.error('Failed to save crew:', error);
      throw error;
    }
  };

  const handleDeleteCrew = async (id: string) => {
    try {
      const response = await fetch(`/api/crew/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      await loadData();
    } catch (error) {
      console.error('Failed to delete crew:', error);
      alert('Failed to delete crew');
    }
  };

  const handleCrewClick = (crew: Crew) => {
    router.push(`/chat/${crew.id}`);
  };

  const handleHire = async (template: Template) => {
    const response = await fetch(`/api/template/${template.id}/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.code === 'LIMIT_EXCEEDED') {
        alert('Free 플랜의 크루 생성 한도(3개)에 도달했습니다. Pro로 업그레이드하세요.');
        return;
      }
      throw new Error('Hire failed');
    }

    const data = await response.json();

    // 최근 채용된 크루 ID 추적
    if (data.crew?.id) {
      setRecentlyHiredIds((prev) => new Set(prev).add(data.crew.id));
    }

    // 성공 토스트 표시 (3초 후 자동 해제)
    setHireSuccess({ name: template.name });
    setTimeout(() => setHireSuccess(null), 3000);

    await loadData();
    // 탭 전환 제거 — Hire Me! 탭에 머물러서 추가 채용 유도
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-cream">
        <Sidebar crews={crews} userNickname={userNickname || undefined} hasGeminiKey={hasGeminiKey ?? undefined} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text-secondary">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cream">
      <Sidebar crews={crews} userNickname={userNickname || undefined} hasGeminiKey={hasGeminiKey ?? undefined} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hero Section */}
        <div className="bg-cream px-10 py-12 border-b border-subtle-gray">
          <h1 className="text-hero font-display text-text-primary mb-3">
            Assemble. Orchestrate. <span className="text-text-secondary">Growth.</span>
          </h1>
          <p className="text-body text-text-secondary max-w-xl">
            Build your AI ensemble and conduct them like a maestro
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="px-10 pt-6 pb-2 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my-crew')}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
              activeTab === 'my-crew'
                ? 'bg-lime text-text-primary'
                : 'text-text-secondary hover:bg-hover-gray'
            }`}
          >
            My Crew
          </button>
          <button
            onClick={() => setActiveTab('hire-me')}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
              activeTab === 'hire-me'
                ? 'bg-lime text-text-primary'
                : 'text-text-secondary hover:bg-hover-gray'
            }`}
          >
            Hire Me!
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-6">
          {activeTab === 'my-crew' && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h2 text-text-primary">My Crew</h2>
                <button
                  onClick={handleAddCrew}
                  className="flex items-center gap-2 px-5 py-2.5 bg-lime hover:bg-lime-hover text-text-primary text-sm font-medium rounded-full transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Crew
                </button>
              </div>

              {crews.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-card">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <img src="/logo.png" alt="Crewster" width={56} height={56} />
                  </div>
                  <h3 className="text-h3 text-text-primary mb-2">Start building your orchestra</h3>
                  <p className="text-body text-text-secondary mb-6">
                    Add your first AI crew member or hire one from the Hire Me! tab
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleAddCrew}
                      className="px-6 py-3 bg-lime hover:bg-lime-hover text-text-primary font-medium rounded-full transition-all"
                    >
                      Create Your First Crew
                    </button>
                    <button
                      onClick={() => setActiveTab('hire-me')}
                      className="px-6 py-3 border border-subtle-gray text-text-secondary hover:bg-hover-gray font-medium rounded-full transition-all"
                    >
                      Hire Me! 둘러보기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {crews.map((crew) => (
                    <CrewCard
                      key={crew.id}
                      crew={crew}
                      onClick={() => handleCrewClick(crew)}
                      onDelete={handleDeleteCrew}
                      onEdit={() => handleEditCrew(crew)}
                      isNew={recentlyHiredIds.has(crew.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'hire-me' && (
            <section>
              <div className="mb-8">
                <h2 className="text-h2 text-text-primary mb-2">Hire Me!</h2>
                <p className="text-body text-text-secondary">
                  각 분야 전문가 AI 크루를 영입하세요. 클릭 한 번으로 바로 팀에 합류합니다.
                </p>
              </div>

              {/* 채용 성공 토스트 */}
              {hireSuccess && (
                <div className="mb-6 px-5 py-4 bg-white border border-lime rounded-2xl shadow-card flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-lg">✅</span>
                  <p className="text-body text-text-primary">
                    <strong>{hireSuccess.name}</strong> 채용이 완료되었습니다! 추가 팀원을 채용해보세요.
                  </p>
                </div>
              )}

              <div className="space-y-10">
                {HIRE_CATEGORY_ORDER.map(({ key, label }) => {
                  const templates = groupedHireTemplates.get(key);
                  if (!templates || templates.length === 0) return null;

                  return (
                    <div key={key}>
                      <h3 className="text-h3 text-text-primary mb-4">{label}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {templates.map((template) => (
                          <HireCard
                            key={template.id}
                            template={template}
                            onHire={handleHire}
                            onDetail={setDetailTemplate}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <CrewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCrew(null);
          setSelectedTemplate(null);
        }}
        onSave={handleSaveCrew}
        crew={editingCrew}
        template={selectedTemplate}
        hireTemplates={hireTemplates}
      />

      <HireDetailModal
        template={detailTemplate}
        isOpen={!!detailTemplate}
        onClose={() => setDetailTemplate(null)}
        onHire={handleHire}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={() => {
          setShowApiKeyModal(false);
          setHasGeminiKey(true);
        }}
      />
    </div>
  );
}
