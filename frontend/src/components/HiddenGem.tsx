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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Hidden Talent Detected</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                {hiddenGems.length} Flagged
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Candidates conventional keyword screening would overlook due to alternative technical terminology.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hiddenGems.map((gem) => (
          <div
            key={gem.candidate_id}
            className="p-6 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-glow-amber hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full mb-2">
                    ✨ High Semantic Fit
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    {gem.candidate_name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Rank #{gem.rank} &bull; Score: {gem.final_score}/100 &bull; Must-Have: {gem.must_have_matched}/{gem.must_have_total}
                  </p>
                </div>

                <button
                  onClick={() => onSelectCandidate(gem)}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Inspect Evidence
                </button>
              </div>

              {/* Visual Keyword vs Semantic Comparison Bar */}
              <div className="my-5 p-4 bg-white/90 rounded-2xl border border-amber-100 space-y-3 shadow-2xs">
                <div>
                  <div className="flex justify-between text-[11px] font-extrabold mb-1">
                    <span className="text-slate-500 uppercase tracking-wider">Traditional ATS Keyword Overlap</span>
                    <span className="text-rose-600 font-black">{gem.keyword_quality_pct}% (Low)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, gem.keyword_quality_pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-rose-500 block mt-0.5">
                    Traditional keyword ATS would reject or rank this candidate at the bottom.
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] font-extrabold mb-1">
                    <span className="text-slate-700 uppercase tracking-wider">Nexora Deep Semantic Fit</span>
                    <span className="text-emerald-600 font-black">{gem.semantic_quality_pct}% (Strong)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, gem.semantic_quality_pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">
                    Verified deep contextual experience with equivalent frameworks and architectures.
                  </span>
                </div>
              </div>

              {/* Rationale Quote */}
              <p className="text-xs text-slate-700 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                &ldquo;{gem.hidden_gem_reason}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
