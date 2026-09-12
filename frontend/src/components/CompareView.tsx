import React, { useState, useEffect } from 'react';
import type { Candidate, ComparisonResult } from '../types';
import { X, Scale, CheckCircle2, Sparkles, Trophy } from 'lucide-react';

interface CompareViewProps {
  candidates: Candidate[];
  initialA?: Candidate | null;
  initialB?: Candidate | null;
  onClose: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  candidates,
  initialA,
  initialB,
  onClose
}) => {
  const [candidateAId, setCandidateAId] = useState<string>(
    initialA ? initialA.candidate_id : candidates[0]?.candidate_id || ""
  );
  const [candidateBId, setCandidateBId] = useState<string>(
    initialB ? initialB.candidate_id : candidates[1]?.candidate_id || ""
  );
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const candA = candidates.find((c) => c.candidate_id === candidateAId);
  const candB = candidates.find((c) => c.candidate_id === candidateBId);

  useEffect(() => {
    if (!candA || !candB) return;

    setIsLoading(true);
    fetch("http://localhost:8000/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_a: candA, candidate_b: candB })
    })
      .then((res) => res.json())
      .then((data) => {
        setComparison(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Comparison API error:", err);
        setIsLoading(false);
      });
  }, [candidateAId, candidateBId, candA, candB]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Compare Candidates (Why A &gt; B)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Side-by-side evidence differential calculated directly from deterministic decision traces.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Selector Bar */}
        <div className="p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
              Candidate A
            </label>
            <select
              value={candidateAId}
              onChange={(e) => setCandidateAId(e.target.value)}
              className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
            >
              {candidates.map((c) => (
                <option key={c.candidate_id} value={c.candidate_id}>
                  #{c.rank} {c.candidate_name} ({c.final_score}/100)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
              Candidate B
            </label>
            <select
              value={candidateBId}
              onChange={(e) => setCandidateBId(e.target.value)}
              className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
            >
              {candidates.map((c) => (
                <option key={c.candidate_id} value={c.candidate_id}>
                  #{c.rank} {c.candidate_name} ({c.final_score}/100)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparative Results Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-slate-500 font-medium">
              Calculating evidence differentials...
            </div>
          ) : comparison && candA && candB ? (
            <>
              {/* Head-to-Head Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center text-[10px] uppercase font-black tracking-widest text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full mb-1">
                    <Trophy className="w-3 h-3 mr-1 text-amber-500" />
                    Rank Advantage
                  </span>
                  <div className="text-base font-black text-slate-900 mt-1">
                    <span className="text-indigo-600 font-black">{comparison.winner}</span> ranks above with a +{comparison.score_difference} pt lead.
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs font-black">
                  <div className="px-4 py-2 rounded-2xl bg-white border border-indigo-200 text-slate-800 shadow-2xs">
                    {comparison.candidate_a}: <span className="text-indigo-600">{comparison.score_a}</span>
                  </div>
                  <span className="text-slate-400">vs</span>
                  <div className="px-4 py-2 rounded-2xl bg-white border border-indigo-200 text-slate-800 shadow-2xs">
                    {comparison.candidate_b}: <span className="text-indigo-600">{comparison.score_b}</span>
                  </div>
                </div>
              </div>

              {/* Horizontal Comparison Bars (Feature 17) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                  SIGNAL-BY-SIGNAL COMPARISON BARS
                </span>

                {/* Semantic Comparison */}
                <div>
                  <div className="flex justify-between text-xs font-extrabold mb-1">
                    <span className="text-slate-700">Semantic Relevance</span>
                    <span className="text-slate-500">
                      {candA.candidate_name}: <strong>{candA.semantic_quality_pct}%</strong> vs {candB.candidate_name}: <strong>{candB.semantic_quality_pct}%</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${candA.semantic_quality_pct}%` }} />
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${candB.semantic_quality_pct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Keyword Comparison */}
                <div>
                  <div className="flex justify-between text-xs font-extrabold mb-1">
                    <span className="text-slate-700">Keyword Relevance</span>
                    <span className="text-slate-500">
                      {candA.candidate_name}: <strong>{candA.keyword_quality_pct}%</strong> vs {candB.candidate_name}: <strong>{candB.keyword_quality_pct}%</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-sky-600 h-full rounded-full" style={{ width: `${candA.keyword_quality_pct}%` }} />
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full" style={{ width: `${candB.keyword_quality_pct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Must-Have Comparison */}
                <div>
                  <div className="flex justify-between text-xs font-extrabold mb-1">
                    <span className="text-slate-700">Must-Have Requirement Coverage</span>
                    <span className="text-slate-500">
                      {candA.candidate_name}: <strong>{candA.must_have_matched}/{candA.must_have_total}</strong> vs {candB.candidate_name}: <strong>{candB.must_have_matched}/{candB.must_have_total}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${candA.must_have_coverage_pct}%` }} />
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${candB.must_have_coverage_pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulleted Why A > B Reasons */}
              <div>
                <h4 className="text-xs uppercase font-black tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  WHY {comparison.winner.toUpperCase()} RANKS HIGHER
                </h4>
                <div className="space-y-2.5">
                  {comparison.why_higher_ranks_above.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3 text-xs text-slate-800 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Deltas Table */}
              <div>
                <h4 className="text-xs uppercase font-black tracking-wider text-slate-800 mb-3">
                  Requirement-Level Evidence Comparison
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Requirement</th>
                        <th className="p-3.5">{comparison.candidate_a}</th>
                        <th className="p-3.5">{comparison.candidate_b}</th>
                        <th className="p-3.5 text-right">Advantage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comparison.detailed_deltas.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-bold text-slate-900">{item.requirement}</td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-700">{item.type_higher}</span>
                            <span className="text-slate-400 ml-1">({item.score_higher})</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-700">{item.type_lower}</span>
                            <span className="text-slate-400 ml-1">({item.score_lower})</span>
                          </td>
                          <td className="p-3.5 text-right font-black text-indigo-600">
                            {item.delta > 0 ? `+${item.delta}` : item.delta}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              Select two candidates to compare their evidence traces.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
