import React, { useState } from 'react';
import type { RequirementTrace } from '../types';
import { Check, CheckCheck, HelpCircle, FileText, CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react';

interface EvidenceCardProps {
  trace: RequirementTrace;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ trace }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getBadgeStyle = () => {
    switch (trace.match_type) {
      case "EXACT MATCH":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
          icon: <CheckCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
          label: "✓ EXACT MATCH"
        };
      case "STRONG RELATED MATCH":
        return {
          bg: "bg-indigo-50 text-indigo-800 border-indigo-300",
          icon: <Check className="w-3.5 h-3.5 mr-1 text-indigo-600" />,
          label: "✓ STRONG RELATED MATCH"
        };
      case "TRANSFERABLE MATCH":
        return {
          bg: "bg-purple-50 text-purple-800 border-purple-300",
          icon: <CornerDownRight className="w-3.5 h-3.5 mr-1 text-purple-600" />,
          label: "TRANSFERABLE MATCH"
        };
      case "PARTIAL MATCH":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-300",
          icon: <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />,
          label: "PARTIAL MATCH"
        };
      case "NO EVIDENCE":
      default:
        return {
          bg: "bg-slate-100 text-slate-500 border-slate-200",
          icon: <span className="w-2 h-2 rounded-full bg-slate-400 mr-1.5 inline-block" />,
          label: "○ NO EVIDENCE"
        };
    }
  };

  const badge = getBadgeStyle();
  const isNoEvidence = trace.match_type === "NO EVIDENCE";

  return (
    <div 
      onClick={() => !isNoEvidence && setIsExpanded(!isExpanded)}
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isNoEvidence 
          ? "bg-slate-50/70 border-slate-200/80 cursor-default" 
          : "bg-white border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs cursor-pointer"
      }`}
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
            {trace.requirement}
          </span>
          {trace.category === "must_have" && (
            <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80">
              Must Have
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center text-xs font-black px-2.5 py-1 rounded-xl border ${badge.bg}`}>
            {badge.icon}
            {badge.label}
          </span>
          {!isNoEvidence && (
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
              Score: {trace.hybrid_score.toFixed(2)}
            </span>
          )}
          {!isNoEvidence && (
            <span className="text-slate-400 hover:text-indigo-600 transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          )}
        </div>
      </div>

      {/* Main Evidence Quote */}
      <div className="text-xs mt-1">
        {isNoEvidence ? (
          <p className="text-slate-400 italic py-1">
            &ldquo;No supporting evidence was found in the resume.&rdquo;
          </p>
        ) : (
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <p className="text-slate-700 italic leading-relaxed font-serif">
              {trace.evidence_text}
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center font-bold text-slate-600">
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {trace.page ? `Page ${trace.page}` : "Extracted Page"}
                {trace.section && trace.section !== "GENERAL" && ` &bull; Section: ${trace.section}`}
              </span>
              <span className="text-[10px] text-indigo-600 font-bold">
                {isExpanded ? "Collapse Decision Trace ▲" : "Click to View AI Trace ▼"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Deep AI Decision Trace */}
      {isExpanded && !isNoEvidence && (
        <div className="mt-3 pt-3 border-t border-slate-100 bg-indigo-50/40 rounded-xl p-3.5 border border-indigo-100 animate-fade-in-up">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 block mb-2">
            WHY THIS MATCH? &bull; SIGNAL BREAKDOWN
          </span>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">BM25 Lexical</span>
              <span className="text-sm font-black text-slate-800">{Math.round(trace.keyword_score * 100)}%</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">MiniLM Semantic</span>
              <span className="text-sm font-black text-slate-800">{Math.round(trace.semantic_score * 100)}%</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-indigo-100 shadow-2xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Skill Graph</span>
              <span className="text-sm font-black text-slate-800">{Math.round(trace.graph_score * 100)}%</span>
            </div>
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-2xs">
              <span className="text-[9px] uppercase font-bold text-indigo-200 block">Hybrid Result</span>
              <span className="text-sm font-black">{trace.hybrid_score.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
