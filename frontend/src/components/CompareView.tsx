import React, { useState, useEffect } from 'react';
import type { Candidate, ComparisonResult } from '../types';
import { X, Scale, CheckCircle2, Sparkles } from 'lucide-react';

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

    // Trigger compare endpoint
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Compare Candidates (Why A &gt; B)
              </h3>
              <p className="text-xs text-slate-500">
                Side-by-side evidence differential calculated directly from decision traces.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Selector Bar */}
        <div className="p-5 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Candidate A
            </label>
            <select
              value={candidateAId}
              onChange={(e) => setCandidateAId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
            >
              {candidates.map((c) => (
                <option key={c.candidate_id} value={c.candidate_id}>
                  #{c.rank} {c.candidate_name} ({c.final_score}/100)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Candidate B
            </label>
            <select
              value={candidateBId}
              onChange={(e) => setCandidateBId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
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
            <div className="text-center py-12 text-xs text-slate-500">
              Calculating evidence differentials...
            </div>
          ) : comparison ? (
            <>
              {/* Head-to-Head Score Banner */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 block mb-1">
                    Rank Advantage
                  </span>
                  <div className="text-base font-extrabold text-slate-900">
                    <span className="text-indigo-600">{comparison.winner}</span> ranks above with a +{comparison.score_difference} pt lead.
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-bold">
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-slate-800">
                    {comparison.candidate_a}: <span className="text-indigo-600">{comparison.score_a}</span>
                  </div>
                  <span className="text-slate-400">vs</span>
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-slate-800">
                    {comparison.candidate_b}: <span className="text-indigo-600">{comparison.score_b}</span>
                  </div>
                </div>
              </div>

              {/* Bulleted Why A > B Reasons */}
              <div>
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  WHY {comparison.winner.toUpperCase()} RANKS HIGHER
                </h4>
                <div className="space-y-2">
                  {comparison.why_higher_ranks_above.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-800 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirement-by-Requirement Evidence Delta Table */}
              <div>
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 mb-3">
                  Requirement-Level Evidence Comparison
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Requirement</th>
                        <th className="p-3">{comparison.candidate_a}</th>
                        <th className="p-3">{comparison.candidate_b}</th>
                        <th className="p-3 text-right">Advantage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comparison.detailed_deltas.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">{item.requirement}</td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-700">{item.type_higher}</span>
                            <span className="text-slate-400 ml-1">({item.score_higher})</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-700">{item.type_lower}</span>
                            <span className="text-slate-400 ml-1">({item.score_lower})</span>
                          </td>
                          <td className="p-3 text-right font-black text-indigo-600">
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
              Select two candidates to compare their evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
