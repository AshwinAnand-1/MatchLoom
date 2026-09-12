import React from 'react';
import type { Candidate } from '../types';
import { Eye, Sparkles } from 'lucide-react';

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
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-amber-100 text-amber-900 border-amber-300 font-black";
    if (rank === 2) return "bg-slate-200 text-slate-800 border-slate-300 font-bold";
    if (rank === 3) return "bg-amber-50 text-amber-800 border-amber-200 font-bold";
    return "bg-slate-50 text-slate-600 border-slate-200 font-medium";
  };

  const getTierBadge = (tier: string) => {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden mb-8">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Deterministic Candidate Rankings
          </h3>
          <p className="text-xs text-slate-500">
            Ranked by calculated hybrid score (BM25 + SentenceTransformers + Skill Graph).
          </p>
        </div>

        {candidates.length >= 2 && (
          <button
            onClick={() => onComparePair(candidates[0], candidates[1])}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            Compare #1 vs #2 →
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
              <th className="py-3 px-4 w-16 text-center">Rank</th>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Overall Score</th>
              <th className="py-3 px-4">Must-Have</th>
              <th className="py-3 px-4">Semantic</th>
              <th className="py-3 px-4">Keyword</th>
              <th className="py-3 px-4">Match Tier</th>
              <th className="py-3 px-4 text-right">Evidence Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {candidates.map((cand) => {
              const rank = cand.rank || 1;
              return (
                <tr
                  key={cand.candidate_id}
                  onClick={() => onSelectCandidate(cand)}
                  className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                >
                  {/* Rank Column */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs border ${getRankBadge(rank)}`}>
                      #{rank}
                    </span>
                  </td>

                  {/* Candidate Name & Flags */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                        {cand.candidate_name}
                      </span>
                      {cand.is_hidden_gem && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5 mr-1 text-amber-600" />
                          Hidden Gem
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {cand.filename}
                    </span>
                  </td>

                  {/* Overall Score with Progress Bar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-black text-slate-900 w-10">
                        {cand.final_score}
                      </span>
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cand.final_score >= 80 ? "bg-emerald-500" : cand.final_score >= 65 ? "bg-indigo-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, cand.final_score)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Must-Have */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">
                      {cand.must_have_matched} / {cand.must_have_total}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({Math.round(cand.must_have_coverage_pct)}%)
                    </span>
                  </td>

                  {/* Semantic */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{cand.semantic_quality_pct}%</span>
                  </td>

                  {/* Keyword */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{cand.keyword_quality_pct}%</span>
                  </td>

                  {/* Match Tier */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getTierBadge(cand.match_tier)}`}>
                      {cand.match_tier}
                    </span>
                  </td>

                  {/* Evidence Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(cand);
                      }}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-700 border border-slate-200 group-hover:border-indigo-200 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
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
