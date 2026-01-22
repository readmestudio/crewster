'use client';

interface CrewAddCardProps {
  onClick: () => void;
}

export default function CrewAddCard({ onClick }: CrewAddCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white border-2 border-dashed border-gray-200/50 rounded-lg p-4 hover:border-gray-300 hover:bg-gray-50/50 transition-all cursor-pointer flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          Add New Crew
        </p>
        <p className="text-xs text-gray-500">Click to create a new crew member</p>
      </div>
    </button>
  );
}
