import React from 'react';
import { Award, CheckCircle2, Sparkles, Users } from 'lucide-react';
import type { TopSummary } from '../types';

interface SummaryCardsProps {
  summary: TopSummary;
  onScrollToGems?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, onScrollToGems }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Top Match Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Top Match</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.top_score}
          </span>
          <span className="text-xs text-slate-400 font-semibold">/ 100</span>
        </div>
        <p className="text-[11px] text-emerald-700 font-medium mt-1">
          Strongest overall fit
        </p>
      </div>

      {/* Must-Have Coverage Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Must-Have Coverage</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.must_have_coverage}
          </span>
        </div>
        <p className="text-[11px] text-indigo-600 font-medium mt-1">
          Core technical qualifications
        </p>
      </div>

      {/* Hidden Gems Card */}
      <div 
        onClick={onScrollToGems}
        className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs transition-all ${
          summary.hidden_gems_count > 0 ? "hover:border-amber-300 hover:shadow-xs cursor-pointer" : ""
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Hidden Gems</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.hidden_gems_count}
          </span>
          <span className="text-xs text-amber-600 font-semibold">Flagged</span>
        </div>
        <p className="text-[11px] text-amber-700 font-medium mt-1">
          High semantic / low keyword
        </p>
      </div>

      {/* Candidates Evaluated Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Candidates</span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.candidates_count}
          </span>
          <span className="text-xs text-slate-400 font-semibold">Resumes</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-1">
          Ranked deterministically
        </p>
      </div>
    </div>
  );
};
