import React from 'react';
import type { JDAudit } from '../types';
import { X, AlertTriangle, CheckCircle, ShieldCheck, AlertOctagon } from 'lucide-react';

interface JDAuditModalProps {
  audit: JDAudit | null;
  onClose: () => void;
}

export const JDAuditModal: React.FC<JDAuditModalProps> = ({ audit, onClose }) => {
  if (!audit) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              audit.is_healthy ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            }`}>
              {audit.is_healthy ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Job Description Insights
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ensure role clarity, balanced requirements, and optimal candidate reach.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                Core Requirements
              </span>
              <span className="text-2xl font-black text-slate-900">{audit.must_have_count}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Essential qualifications</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                Preferred Qualifications
              </span>
              <span className="text-2xl font-black text-slate-900">{audit.nice_to_have_count}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Bonus competencies</span>
            </div>
          </div>

          {/* Audit Issues */}
          {audit.warnings.length > 0 ? (
            <div>
              <h4 className="text-xs uppercase font-black tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-amber-600" />
                Recommendations ({audit.warnings.length})
              </h4>
              <div className="space-y-3">
                {audit.warnings.map((warn, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs shadow-2xs">
                    <div className="font-extrabold text-amber-950 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      {warn}
                    </div>
                    {audit.suggestions[idx] && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60 text-amber-800 text-[11px] leading-relaxed">
                        <strong>Recruiter Suggestion:</strong> {audit.suggestions[idx]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3 shadow-2xs">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-sm block mb-0.5">Balanced Job Description</span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Job description is well-balanced with clear, focused, and realistic technical criteria. No excessive constraints or competing framework demands detected.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Focused role criteria yield higher-quality candidate matches.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
