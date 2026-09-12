import React from 'react';
import type { JDAudit } from '../types';
import { X, AlertTriangle, CheckCircle, Lightbulb, ShieldCheck } from 'lucide-react';

interface JDAuditModalProps {
  audit: JDAudit | null;
  onClose: () => void;
}

export const JDAuditModal: React.FC<JDAuditModalProps> = ({ audit, onClose }) => {
  if (!audit) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              audit.is_healthy ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>
              {audit.is_healthy ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Job Description Quality & Narrowness Audit
              </h3>
              <p className="text-xs text-slate-500">
                Automated heuristic evaluation to maximize talent pool reach.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Must-Have Requirements</span>
              <span className="text-xl font-black text-slate-900">{audit.must_have_count}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nice-to-Have Requirements</span>
              <span className="text-xl font-black text-slate-900">{audit.nice_to_have_count}</span>
            </div>
          </div>

          {/* Warnings list */}
          {audit.warnings.length > 0 ? (
            <div>
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Detected Optimization Opportunities ({audit.warnings.length})
              </h4>
              <div className="space-y-2">
                {audit.warnings.map((warn, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 font-medium">
                    {warn}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Job Description is well-balanced with clear, focused, and realistic technical criteria.</span>
            </div>
          )}

          {/* Suggestions list */}
          {audit.suggestions.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-indigo-800 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                Recruiter Recommendations
              </h4>
              <div className="space-y-2">
                {audit.suggestions.map((sug, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
                    {sug}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
