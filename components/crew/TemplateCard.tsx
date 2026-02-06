'use client';

export interface Template {
  id: string;
  name: string;
  role: string;
  description: string;
  iconEmoji: string;
  instructions: string;
}

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
}

export default function TemplateCard({ template, onUse }: TemplateCardProps) {
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer">
      {/* Icon */}
      <div className="text-4xl mb-4">{template.iconEmoji}</div>

      {/* Content */}
      <h3 className="text-h3 text-text-primary mb-1">{template.name}</h3>
      <p className="text-caption text-text-secondary mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* CTA Button */}
      <button
        onClick={() => onUse(template)}
        className="px-5 py-2.5 bg-lime hover:bg-lime-hover text-text-primary text-sm font-medium rounded-full transition-all"
      >
        Use Template
      </button>
    </div>
  );
}
