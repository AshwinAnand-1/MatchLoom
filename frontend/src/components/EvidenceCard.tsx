import React from 'react';
import type { RequirementTrace } from '../types';
import { Check, CheckCheck, HelpCircle, FileText, CornerDownRight } from 'lucide-react';

interface EvidenceCardProps {
  trace: RequirementTrace;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ trace }) => {
  const getBadgeStyle = () => {
    switch (trace.match_type) {
      case "EXACT MATCH":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
          label: "✓ EXACT MATCH"
        };
      case "STRONG RELATED MATCH":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: <Check className="w-3.5 h-3.5 mr-1 text-indigo-600" />,
          label: "✓ STRONG RELATED MATCH"
        };
      case "TRANSFERABLE MATCH":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <CornerDownRight className="w-3.5 h-3.5 mr-1 text-blue-600" />,
          label: "TRANSFERABLE MATCH"
        };
      case "PARTIAL MATCH":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
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
    <div className={`p-4 rounded-xl border transition-all ${
      isNoEvidence ? "bg-slate-50/70 border-slate-200" : "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
    }`}>
      {/* Card Header: Requirement & Match Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-900 text-sm">{trace.requirement}</span>
          {trace.category === "must_have" && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
              Must Have
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border ${badge.bg}`}>
            {badge.icon}
            {badge.label}
          </span>
          {!isNoEvidence && (
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
              Score: {trace.hybrid_score.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Evidence Quote Block */}
      <div className="text-xs">
        {isNoEvidence ? (
          <p className="text-slate-500 italic py-1">
            &ldquo;No supporting evidence was found in the resume.&rdquo;
          </p>
        ) : (
          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100 mt-1">
            <p className="text-slate-700 italic leading-relaxed">
              {trace.evidence_text}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
              <span className="flex items-center font-medium text-slate-600">
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {trace.page ? `Page ${trace.page}` : "Extracted Page"}
                {trace.section && trace.section !== "GENERAL" && ` • Section: ${trace.section}`}
              </span>
              <div className="flex items-center space-x-3 text-[10px]">
                <span>Sem: {Math.round(trace.semantic_score * 100)}%</span>
                <span>BM25: {Math.round(trace.keyword_score * 100)}%</span>
                <span>Graph: {Math.round(trace.graph_score * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
