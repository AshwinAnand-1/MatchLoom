import React from 'react';
import type { Candidate } from '../types';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

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
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Potentially Overlooked Candidates</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                {hiddenGems.length} Found
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              High-capability talent that traditional keyword-only applicant tracking systems often filter out.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hiddenGems.map((gem) => (
          <div
            key={gem.candidate_id}
            className="p-6 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 rounded-3xl border border-amber-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full mb-2">
                    ✨ Hidden Gem
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    {gem.candidate_name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-bold text-slate-700">Score: {gem.final_score}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {gem.must_have_matched} of {gem.must_have_total} core requirements verified
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCandidate(gem)}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  Inspect Candidate
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>

              {/* Recruiter Comparison Insight */}
              <div className="my-4 p-4 bg-white/90 rounded-2xl border border-amber-100/80 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Traditional Keyword ATS:</span>
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 text-[11px]">
                    Likely Overlooked / Filtered Out
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                  <span className="text-slate-700 font-semibold">MatchLoom Evaluation:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
                    Strong Role Alignment with Project Evidence
                  </span>
                </div>
              </div>

              {/* Human-readable recruiter reason */}
              <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100/70 leading-relaxed font-medium">
                Strong evidence of role-relevant experience despite lower traditional keyword overlap. Candidate demonstrates practical proficiency in equivalent architectures and core requirements.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
