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

  const getRankTheme = (rank: number) => {
    if (rank === 1) return {
      badge: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs font-black",
      border: "border-amber-200 hover:border-amber-300 hover:shadow-glow-amber",
      accent: "text-amber-700 bg-amber-50 border-amber-200/80",
      pill: "Gold Match"
    };
    if (rank === 2) return {
      badge: "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-xs font-black",
      border: "border-slate-200 hover:border-slate-300 hover:shadow-md",
      accent: "text-slate-700 bg-slate-50 border-slate-200/80",
      pill: "Silver Match"
    };
    return {
      badge: "bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-xs font-black",
      border: "border-amber-100 hover:border-amber-200 hover:shadow-md",
      accent: "text-amber-800 bg-amber-50 border-amber-200/80",
      pill: "Bronze Match"
    };
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Top 3 Shortlisted Candidates
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
            Verified Decision Rationale
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">Click candidate to open full trace</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {top3.map((item) => {
          const matchedCand = candidates.find((c) => c.candidate_id === item.candidate_id);
          const theme = getRankTheme(item.rank);

          return (
            <div
              key={item.candidate_id}
              onClick={() => matchedCand && onSelectCandidate(matchedCand)}
              className={`p-6 rounded-3xl bg-white border ${theme.border} shadow-2xs hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
            >
              <div>
                {/* Header with Rank Badge & Score */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-xl text-xs ${theme.badge}`}>
                    RANK #{item.rank}
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {item.final_score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">/100</span>
                  </div>
                </div>

                {/* Candidate Name */}
                <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.candidate_name}
                </h4>

                {/* Recruiter Metric Pills */}
                {matchedCand && (
                  <div className="flex items-center space-x-2 my-3 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                      {matchedCand.must_have_matched} of {matchedCand.must_have_total} Core Met
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                      {matchedCand.match_tier} Match
                    </span>
                  </div>
                )}

                {/* Recruiter Rationale Box */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100/90 mt-2 font-medium">
                  {item.explanation}
                </p>
              </div>

              {/* Action Link */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                <span>View Candidate Evidence</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
