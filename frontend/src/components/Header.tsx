import React from 'react';
import { Sparkles, FileSearch } from 'lucide-react';
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200 text-white font-black text-xl tracking-wider">
            N
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">NEXORA</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                HYBRID AI SHORTLISTING
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Evidence-First AI Hiring Intelligence &bull; Rank candidates. Inspect evidence. Make the decision.
            </p>
          </div>
        </div>

        {/* Global Action Badges & Buttons */}
        <div className="flex items-center space-x-3">
          {jdAudit && (
            <button
              onClick={onOpenAudit}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            >
              <FileSearch className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              JD Quality Audit
              {auditWarningsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {auditWarningsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenCompare}
            disabled={!canCompare}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${
              canCompare
                ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            Compare Candidates (A vs B)
          </button>
        </div>
      </div>
    </header>
  );
};
