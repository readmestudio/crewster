'use client';

import { useState, useEffect } from 'react';
import { Crew } from '@/types';

interface CrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; role: string; instructions: string }) => Promise<void>;
  crew?: Crew | null;
}

export default function CrewModal({ isOpen, onClose, onSave, crew }: CrewModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (crew) {
      setName(crew.name);
      setRole(crew.role);
      setInstructions(crew.instructions);
    } else {
      setName('');
      setRole('');
      setInstructions('');
    }
  }, [crew, isOpen]);

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
      console.error('저장 오류:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {crew ? 'Edit Crew' : 'Add New Crew'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dopamine Copywriter Geun"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Copywriter specializing in SNS hook copy and USP discovery"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions (Prompt) *
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe the crew's role and behavioral guidelines in detail"
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : crew ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}