'use client';

import { useState } from 'react';
import { Crew } from '@/types';

interface OptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  crew: Crew | null;
  conversationContext: string;
  onOptimizeComplete: (optimizedCrew: Crew) => void;
  onEditCrew: (crew: Crew) => void;
}

export default function OptimizeModal({ 
  isOpen, 
  onClose, 
  crew, 
  conversationContext,
  onOptimizeComplete,
  onEditCrew 
}: OptimizeModalProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedCrew, setOptimizedCrew] = useState<Crew | null>(null);

  const handleOptimize = async () => {
    if (!crew) return;

    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewId: crew.id,
          conversationContext,
          reason: 'User requested instruction optimization during chat',
        }),
      });

      if (!response.ok) throw new Error('Optimization failed');

      const data = await response.json();
      setOptimizedCrew(data.crew);
      onOptimizeComplete(data.crew);
    } catch (error) {
      console.error('Optimization error:', error);
      alert('An error occurred during optimization.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleEdit = () => {
    if (optimizedCrew) {
      onEditCrew(optimizedCrew);
      onClose();
    }
  };

  if (!isOpen || !crew) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Optimize Instructions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {!optimizedCrew ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Based on the conversation with <strong>{crew.name}</strong>, we will optimize the crew&apos;s instructions to better match your preferences.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Conversation Context:</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{conversationContext}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOptimizing ? 'Optimizing...' : 'Optimize Instructions'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✓ Instructions have been optimized successfully!
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Optimized Instructions:</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{optimizedCrew.instructions}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Done
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Crew
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
