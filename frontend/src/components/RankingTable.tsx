import React from 'react';
import type { Candidate } from '../types';
import { Eye, Sparkles, Scale } from 'lucide-react';

interface RankingTableProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  onComparePair: (candidateA: Candidate, candidateB: Candidate) => void;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  candidates,
  onSelectCandidate,
  onComparePair
}) => {
  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return "bg-amber-100 text-amber-900 border-amber-300 font-black shadow-2xs";
    if (rank === 2) return "bg-slate-200 text-slate-800 border-slate-300 font-extrabold";
    if (rank === 3) return "bg-amber-50 text-amber-800 border-amber-200 font-extrabold";
    return "bg-slate-50 text-slate-600 border-slate-200 font-bold";
  };

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case "Strong":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Good":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Moderate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Deterministic Candidate Rankings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
              Multi-Factor Mathematical Sort
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by calculated hybrid formula: 50% Must-Have + 5% Nice-Have + 45% Signal Weights.
          </p>
        </div>

        {candidates.length >= 2 && (
          <button
            onClick={() => onComparePair(candidates[0], candidates[1])}
            className="inline-flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-4 py-2 rounded-xl transition-all hover:shadow-2xs cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 mr-1.5" />
            Compare #1 vs #2 →
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <th className="py-3.5 px-4 w-16 text-center">Rank</th>
              <th className="py-3.5 px-4">Candidate Name</th>
              <th className="py-3.5 px-4">Overall Score</th>
              <th className="py-3.5 px-4">Must-Have Match</th>
              <th className="py-3.5 px-4">Semantic Fit</th>
              <th className="py-3.5 px-4">Keyword Fit</th>
              <th className="py-3.5 px-4">Match Tier</th>
              <th className="py-3.5 px-4 text-right">Decision Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {candidates.map((cand, idx) => {
              const rank = cand.rank || idx + 1;
              return (
                <tr
                  key={cand.candidate_id}
                  onClick={() => onSelectCandidate(cand)}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="animate-fade-in-up hover:bg-slate-50/90 transition-colors cursor-pointer group"
                >
                  {/* Rank Badge */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs border ${getRankBadgeStyle(rank)}`}>
                      #{rank}
                    </span>
                  </td>

                  {/* Candidate Identity */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                        {cand.candidate_name}
                      </span>
                      {cand.is_hidden_gem && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5 mr-1 text-amber-600 animate-pulse" />
                          Hidden Gem
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      {cand.filename}
                    </span>
                  </td>

                  {/* Overall Score with Progress Bar */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-black text-slate-900 w-10">
                        {cand.final_score}
                      </span>
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            cand.final_score >= 75 ? "bg-emerald-500" : cand.final_score >= 60 ? "bg-indigo-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, cand.final_score)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Must-Have */}
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {cand.must_have_matched} / {cand.must_have_total}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-bold">
                      ({Math.round(cand.must_have_coverage_pct)}%)
                    </span>
                  </td>

                  {/* Semantic */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800">{cand.semantic_quality_pct}%</span>
                  </td>

                  {/* Keyword */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800">{cand.keyword_quality_pct}%</span>
                  </td>

                  {/* Match Tier */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center text-[11px] font-extrabold px-3 py-1 rounded-full border ${getTierBadgeStyle(cand.match_tier)}`}>
                      {cand.match_tier}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(cand);
                      }}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white group-hover:bg-indigo-600 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-indigo-600 transition-all duration-150 shadow-2xs group-hover:shadow-glow-indigo cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Inspect Evidence
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
