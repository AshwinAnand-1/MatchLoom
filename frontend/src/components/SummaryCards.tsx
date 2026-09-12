import React from 'react';
import { Award, CheckCircle2, Sparkles, Users } from 'lucide-react';
import type { TopSummary } from '../types';
import { useCountUp } from '../hooks/useCountUp';

interface SummaryCardsProps {
  summary: TopSummary;
  onScrollToGems?: () => void;
  onScrollToScatter?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  summary, 
  onScrollToGems,
  onScrollToScatter 
}) => {
  const animatedScore = useCountUp(summary.top_score, 1200);
  const animatedCandidates = useCountUp(summary.candidates_count, 800);
  const animatedGems = useCountUp(summary.hidden_gems_count, 800);

  // SVG Circular progress radius
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, summary.top_score) / 100) * circumference;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Top Match Card with Circular SVG Ring */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Top Match Score
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {animatedScore.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
              Strongest overall fit
            </p>
          </div>

          {/* SVG Progress Ring */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-14 h-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke="#10b981"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-700">
              {Math.round(summary.top_score)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Must-Have Coverage Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Must-Have Coverage
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {summary.must_have_coverage}
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 font-extrabold mt-1">
            Core qualifications verified
          </p>
        </div>
      </div>

      {/* 3. Hidden Gems Card with Glow */}
      <div 
        onClick={onScrollToGems}
        className={`bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs transition-all duration-200 group cursor-pointer ${
          summary.hidden_gems_count > 0 
            ? "hover:border-amber-300 hover:shadow-glow-amber hover:-translate-y-0.5" 
            : ""
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Hidden Gems Detected
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black text-amber-600 tracking-tight">
              {animatedGems}
            </span>
            <span className="text-xs text-amber-700 font-extrabold">Overlooked Talent</span>
          </div>
          <p className="text-[11px] text-amber-700 font-extrabold mt-1 flex items-center gap-1">
            <span>High semantic &bull; low keyword</span>
          </p>
        </div>
      </div>

      {/* 4. Total Candidates Evaluated */}
      <div 
        onClick={onScrollToScatter}
        className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Candidates Evaluated
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {animatedCandidates}
            </span>
            <span className="text-xs text-slate-400 font-extrabold">Resumes</span>
          </div>
          <p className="text-[11px] text-slate-500 font-bold mt-1">
            Deterministic Python formula
          </p>
        </div>
      </div>
    </div>
  );
};
