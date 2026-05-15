
import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
  </div>
);
