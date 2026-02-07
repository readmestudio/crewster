'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crew } from '@/types';
import Sidebar from '@/components/layout/Sidebar';
import CrewCard from '@/components/crew/CrewCard';
import CrewModal from '@/components/crew/CrewModal';
import TemplateCard, { Template } from '@/components/crew/TemplateCard';
import ApiKeyModal from '@/components/modals/ApiKeyModal';

export default function CrewPage() {
  const router = useRouter();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);

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
      setTemplates(templatesData.templates || []);

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

  const handleUseTemplate = (template: Template) => {
    setEditingCrew(null);
    setSelectedTemplate(template);
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
            Build Your<br />
            <span className="text-text-secondary">AI Orchestra</span>
          </h1>
          <p className="text-body text-text-secondary max-w-xl">
            AI 크루와 함께 아이디어를 현실로 만들어보세요. 전문가 팀을 구성하고 협업을 시작하세요.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {/* Templates Section */}
          {templates.length > 0 && (
            <section className="mb-12">
              <h2 className="text-h2 text-text-primary mb-6">Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {templates.slice(0, 8).map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                  />
                ))}
              </div>
            </section>
          )}

          {/* My Crew Section */}
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
                  Add your first AI crew member or use a template to get started
                </p>
                <button
                  onClick={handleAddCrew}
                  className="px-6 py-3 bg-lime hover:bg-lime-hover text-text-primary font-medium rounded-full transition-all"
                >
                  Create Your First Crew
                </button>
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
                  />
                ))}
              </div>
            )}
          </section>
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
