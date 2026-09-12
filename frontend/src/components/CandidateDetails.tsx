import React, { useState } from 'react';
import type { Candidate } from '../types';
import { EvidenceCard } from './EvidenceCard';
import { X, Sparkles, ChevronRight, Cpu, Network, GitBranch, ArrowRight } from 'lucide-react';

interface CandidateDetailsProps {
  candidate: Candidate;
  onClose: () => void;
  onCompareWith?: (candidate: Candidate) => void;
}

export const CandidateDetails: React.FC<CandidateDetailsProps> = ({
  candidate,
  onClose,
  onCompareWith
}) => {
  const [filter, setFilter] = useState<"all" | "must_have" | "nice_to_have" | "matched">("all");

  const filteredTraces = candidate.traces.filter((t) => {
    if (filter === "must_have") return t.category === "must_have";
    if (filter === "nice_to_have") return t.category === "nice_to_have";
    if (filter === "matched") return t.is_matched;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in-up">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200/80 bg-slate-50/60 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs">
                #{candidate.rank}
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {candidate.candidate_name}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                candidate.match_tier === "Strong"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : candidate.match_tier === "Good"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {candidate.match_tier} Match
              </span>
              {candidate.is_hidden_gem && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                  Hidden Gem
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Source: {candidate.filename}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Level Score Dashboard */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 grid grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Score</span>
            <span className="text-2xl font-black text-slate-900">{candidate.final_score}</span>
            <span className="text-[9px] text-emerald-600 block font-bold mt-0.5">Deterministic</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Must-Have</span>
            <span className="text-2xl font-black text-indigo-600">
              {candidate.must_have_matched} / {candidate.must_have_total}
            </span>
            <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Core Requirements</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Semantic Fit</span>
            <span className="text-2xl font-black text-slate-800">{candidate.semantic_quality_pct}%</span>
            <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">MiniLM Cosine</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Keyword Fit</span>
            <span className="text-2xl font-black text-slate-800">{candidate.keyword_quality_pct}%</span>
            <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">BM25 Okapi</span>
          </div>
        </div>

        {/* Signal Architecture Flow Banner (Feature 12) */}
        <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100/70">
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-900 block mb-2">
            MULTI-SIGNAL DECISION ARCHITECTURE
          </span>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-white p-2.5 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              <span>BM25 ({candidate.keyword_quality_pct}%)</span>
            </div>
            <span>+</span>
            <div className="flex items-center space-x-1.5">
              <Network className="w-3.5 h-3.5 text-purple-600" />
              <span>Semantic ({candidate.semantic_quality_pct}%)</span>
            </div>
            <span>+</span>
            <div className="flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
              <span>Graph ({candidate.relationship_quality_pct}%)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              Score {candidate.final_score}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <h3 className="text-xs uppercase font-black tracking-wider text-slate-800">
            DECISION TRACE &bull; VERIFIED EVIDENCE
          </h3>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All ({candidate.traces.length})
            </button>
            <button
              onClick={() => setFilter("must_have")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filter === "must_have" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Must-Have
            </button>
            <button
              onClick={() => setFilter("matched")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filter === "matched" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Evidence Found
            </button>
          </div>
        </div>

        {/* Traces List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {filteredTraces.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No requirements match this filter.
            </div>
          ) : (
            filteredTraces.map((trace, idx) => (
              <EvidenceCard key={idx} trace={trace} />
            ))
          )}
        </div>

        {/* Footer */}
        {onCompareWith && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Compare this candidate against any other applicant
            </span>
            <button
              onClick={() => onCompareWith(candidate)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-glow-indigo transition-all cursor-pointer"
            >
              Compare Candidate
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
