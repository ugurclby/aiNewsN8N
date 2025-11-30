import React from 'react';
import { Source } from '../types';

interface SourceCardProps {
  source: Source;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, isSelected, onToggle }) => {
  return (
    <div 
      onClick={() => onToggle(source.id)}
      className={`
        relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group
        ${isSelected 
          ? 'bg-n8n-primary/10 border-n8n-primary shadow-[0_0_15px_rgba(255,109,90,0.2)]' 
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
        }
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-semibold ${isSelected ? 'text-n8n-primary' : 'text-slate-200'}`}>
            {source.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">{source.url.replace('https://', '')}</p>
        </div>
        <div className={`
          w-5 h-5 rounded border flex items-center justify-center transition-colors
          ${isSelected ? 'bg-n8n-primary border-n8n-primary' : 'border-slate-600 bg-slate-900'}
        `}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-400 mt-3 line-clamp-2">
        {source.description}
      </p>
      <span className="absolute top-4 right-10 text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
        {source.category}
      </span>
    </div>
  );
};
