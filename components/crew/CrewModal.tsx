'use client';

import { useState, useEffect } from 'react';
import { Crew } from '@/types';

interface Template {
  id: string;
  name: string;
  role: string;
  description: string;
  iconEmoji: string;
  instructions: string;
}

interface CrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; role: string; instructions: string }) => Promise<void>;
  crew?: Crew | null;
  template?: Template | null;
}

export default function CrewModal({ isOpen, onClose, onSave, crew, template }: CrewModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (crew) {
      setName(crew.name);
      setRole(crew.role);
      setInstructions(crew.instructions);
    } else if (template) {
      setName(template.name);
      setRole(template.role);
      setInstructions(template.instructions);
    } else {
      setName('');
      setRole('');
      setInstructions('');
    }
  }, [crew, template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !instructions.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        role: role.trim(),
        instructions: instructions.trim()
      });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!crew;
  const isFromTemplate = !!template && !crew;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-h2 text-text-primary">
              {isEditing ? 'Edit Crew' : isFromTemplate ? 'Create from Template' : 'Add New Crew'}
            </h2>
            {isFromTemplate && (
              <p className="text-caption text-text-secondary mt-1">
                Customize the template to fit your needs
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xl p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Manager"
              className="w-full px-4 py-3 border border-subtle-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent bg-white text-text-primary placeholder:text-text-secondary/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Defines product vision and roadmap"
              className="w-full px-4 py-3 border border-subtle-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent bg-white text-text-primary placeholder:text-text-secondary/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe the crew's role and behavioral guidelines in detail..."
              rows={10}
              className="w-full px-4 py-3 border border-subtle-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent resize-none bg-white text-text-primary placeholder:text-text-secondary/50"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-subtle-gray">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-subtle-gray text-text-secondary rounded-full hover:bg-hover-gray transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-lime hover:bg-lime-hover text-text-primary font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create Crew'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
