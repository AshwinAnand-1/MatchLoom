import React from 'react';
import { Sparkles, FileSearch, Scale } from 'lucide-react';
import type { JDAudit } from '../types';

interface HeaderProps {
  jdAudit?: JDAudit | null;
  onOpenAudit: () => void;
  onOpenCompare: () => void;
  canCompare: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  jdAudit,
  onOpenAudit,
  onOpenCompare,
  canCompare
}) => {
  const auditWarningsCount = jdAudit?.warnings?.length || 0;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3.5 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200/80 text-white font-black text-xl tracking-wider group-hover:scale-105 group-hover:shadow-glow-indigo transition-all duration-300">
            N
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors">
                NEXORA
              </span>
              
              {/* Shimmering Badge */}
              <div className="relative overflow-hidden rounded-full px-2.5 py-0.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200 shadow-2xs">
                <span className="relative z-10 inline-flex items-center text-[10px] font-black tracking-wider text-indigo-800 uppercase">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-600 animate-spin-slow" />
                  EVIDENCE-FIRST HIRING
                </span>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Find the strongest candidates — and understand why.
            </p>
          </div>
        </div>

        {/* Action Buttons with smooth hover lifts and glows */}
        <div className="flex items-center space-x-3">
          {jdAudit && (
            <button
              onClick={onOpenAudit}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <FileSearch className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Job Description Insights
              {auditWarningsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-black">
                  {auditWarningsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenCompare}
            disabled={!canCompare}
            className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              canCompare
                ? "bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 hover:border-indigo-300 shadow-2xs hover:shadow-glow-indigo hover:-translate-y-0.5 cursor-pointer"
                : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            <Scale className="w-3.5 h-3.5 mr-1.5" />
            Compare Candidates (A vs B)
          </button>
        </div>
      </div>
    </header>
  );
};
