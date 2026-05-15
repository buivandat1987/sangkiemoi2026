
import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea';
  onAIGenerate?: () => void;
  isGenerating?: boolean;
  placeholder?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  onAIGenerate,
  isGenerating,
  placeholder
}) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {onAIGenerate && (
        <button
          onClick={onAIGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Gợi ý bằng AI
        </button>
      )}
    </div>
    {type === 'text' ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
      />
    ) : (
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
      />
    )}
  </div>
);
