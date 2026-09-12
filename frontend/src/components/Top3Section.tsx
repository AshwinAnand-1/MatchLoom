import React from 'react';
import type { Top3Explanation, Candidate } from '../types';
import { Award, ChevronRight } from 'lucide-react';

interface Top3SectionProps {
  top3: Top3Explanation[];
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
}

export const Top3Section: React.FC<Top3SectionProps> = ({
  top3,
  candidates,
  onSelectCandidate
}) => {
  if (!top3 || top3.length === 0) return null;

  const getRankColor = (rank: number) => {
    if (rank === 1) return {
      badge: "bg-amber-100 text-amber-900 border-amber-300",
      border: "border-amber-200",
      glow: "from-amber-500/10"
    };
    if (rank === 2) return {
      badge: "bg-slate-200 text-slate-800 border-slate-300",
      border: "border-slate-200",
      glow: "from-slate-400/10"
    };
    return {
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      border: "border-amber-100",
      glow: "from-orange-500/10"
    };
  };

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-3">
        <Award className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
          🏆 Top 3 Shortlisted Candidates
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Decision trace AI rationales
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((item) => {
          const matchedCand = candidates.find((c) => c.candidate_id === item.candidate_id);
          const style = getRankColor(item.rank);

          return (
            <div
              key={item.candidate_id}
              className={`p-5 rounded-2xl bg-white border ${style.border} shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${style.badge}`}>
                    RANK #{item.rank}
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-slate-900">
                      {item.final_score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">/100</span>
                  </div>
                </div>

                <h4 className="text-base font-extrabold text-slate-900">
                  {item.candidate_name}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed mt-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  {item.explanation}
                </p>
              </div>

              {matchedCand && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">
                    Must-Have: {matchedCand.must_have_matched}/{matchedCand.must_have_total}
                  </span>
                  <button
                    onClick={() => onSelectCandidate(matchedCand)}
                    className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    View Trace
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
