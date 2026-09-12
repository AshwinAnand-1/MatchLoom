import React from 'react';
import type { RequirementTrace } from '../types';
import { Check, CheckCheck, FileText, CornerDownRight, HelpCircle, AlertCircle } from 'lucide-react';

interface EvidenceCardProps {
  trace: RequirementTrace;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ trace }) => {
  const getBadgeStyle = () => {
    switch (trace.match_type) {
      case "EXACT MATCH":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
          icon: <CheckCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
          label: "Exact Match"
        };
      case "STRONG RELATED MATCH":
        return {
          bg: "bg-indigo-50 text-indigo-800 border-indigo-300",
          icon: <Check className="w-3.5 h-3.5 mr-1 text-indigo-600" />,
          label: "Strong Related Match"
        };
      case "TRANSFERABLE MATCH":
        return {
          bg: "bg-purple-50 text-purple-800 border-purple-300",
          icon: <CornerDownRight className="w-3.5 h-3.5 mr-1 text-purple-600" />,
          label: "Transferable Match"
        };
      case "PARTIAL MATCH":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-300",
          icon: <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />,
          label: "Partial Match"
        };
      case "NO EVIDENCE":
      default:
        return {
          bg: "bg-slate-100 text-slate-500 border-slate-200",
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />,
          label: "No Supporting Evidence"
        };
    }
  };

  const badge = getBadgeStyle();
  const isNoEvidence = trace.match_type === "NO EVIDENCE";

  return (
    <div 
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isNoEvidence 
          ? "bg-slate-50/60 border-slate-200" 
          : "bg-white border-slate-200 shadow-2xs hover:border-indigo-200"
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
              Core Requirement
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center text-xs font-black px-2.5 py-1 rounded-xl border ${badge.bg}`}>
            {badge.icon}
            {badge.label}
          </span>
        </div>
      </div>

      {/* Main Evidence Quote */}
      <div className="text-xs mt-2">
        {isNoEvidence ? (
          <p className="text-slate-400 italic py-1 px-3 bg-slate-100/60 rounded-xl">
            &ldquo;No supporting evidence was found in the resume.&rdquo;
          </p>
        ) : (
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <p className="text-slate-700 italic leading-relaxed font-serif">
              &ldquo;{trace.evidence_text}&rdquo;
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center font-bold text-slate-600">
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Resume &mdash; {trace.page ? `Page ${trace.page}` : "Extracted Page"}
                {trace.section && trace.section !== "GENERAL" && ` &bull; Section: ${trace.section}`}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                Verified Quote
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
