import React from 'react';
import type { Candidate } from '../types';
import { Sparkles, Eye } from 'lucide-react';

interface HiddenGemProps {
  hiddenGems: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
}

export const HiddenGem: React.FC<HiddenGemProps> = ({ hiddenGems, onSelectCandidate }) => {
  if (!hiddenGems || hiddenGems.length === 0) return null;

  return (
    <div id="hidden-gems-section" className="mb-8">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
          Hidden Gem Detection
        </h3>
        <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
          {hiddenGems.length} Detected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hiddenGems.map((gem) => (
          <div
            key={gem.candidate_id}
            className="p-5 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 rounded-2xl border border-amber-200/90 shadow-xs relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full mb-2">
                  ✨ High Semantic Potential
                </span>
                <h4 className="text-lg font-extrabold text-slate-900">
                  {gem.candidate_name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Rank #{gem.rank} &bull; Score: {gem.final_score}/100
                </p>
              </div>

              <button
                onClick={() => onSelectCandidate(gem)}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Inspect
              </button>
            </div>

            {/* Keyword vs Semantic Visual Comparison */}
            <div className="my-4 grid grid-cols-2 gap-2 bg-white/80 p-3 rounded-xl border border-amber-100 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Keyword Overlap</span>
                <span className="text-lg font-black text-rose-600">{gem.keyword_quality_pct}%</span>
                <span className="text-[10px] text-slate-400 block">Traditional ATS filters this</span>
              </div>
              <div className="border-l border-slate-100 pl-3">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Semantic Relevance</span>
                <span className="text-lg font-black text-emerald-600">{gem.semantic_quality_pct}%</span>
                <span className="text-[10px] text-slate-400 block">Verified deep capability</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic leading-relaxed">
              &ldquo;{gem.hidden_gem_reason}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
