import React from 'react';
import { FileText, Cpu, Network, Sparkles, CheckCheck, Award, ArrowRight } from 'lucide-react';

interface PipelineFlowVisualProps {
  isAnalyzing?: boolean;
}

export const PipelineFlowVisual: React.FC<PipelineFlowVisualProps> = ({ isAnalyzing }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-xs relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-ping' : 'bg-indigo-600 animate-pulse'}`} />
          <span className="text-[11px] font-black tracking-wider uppercase text-slate-500">
            {isAnalyzing ? "Executing Multi-Signal Decision Pipeline..." : "MatchLoom Multi-Signal Decision Pipeline"}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
          Deterministic Tri-Signal Architecture
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
        {/* Node 1: Input JD */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col items-center text-center transition-all hover:border-indigo-300">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
          <span className="text-xs font-extrabold text-slate-900 mt-0.5">JD & Resumes</span>
          <span className="text-[10px] text-slate-400">PyMuPDF Chunks</span>
        </div>

        {/* Node 2: Requirement Extraction */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col items-center text-center transition-all hover:border-indigo-300">
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 2</span>
          <span className="text-xs font-extrabold text-slate-900 mt-0.5">Requirements</span>
          <span className="text-[10px] text-slate-400">Must vs Nice-to-Have</span>
        </div>

        {/* Node 3: BM25 Lexical Matching */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col items-center text-center transition-all hover:border-indigo-300">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signal A</span>
          <span className="text-xs font-extrabold text-slate-900 mt-0.5">BM25 Lexical</span>
          <span className="text-[10px] text-slate-400">rank_bm25 (w_kw)</span>
        </div>

        {/* Node 4: Semantic Embeddings */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col items-center text-center transition-all hover:border-indigo-300">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Network className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signal B</span>
          <span className="text-xs font-extrabold text-slate-900 mt-0.5">all-MiniLM-L6</span>
          <span className="text-[10px] text-slate-400">Dense Cosine Sim</span>
        </div>

        {/* Node 5: Skill Graph */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col items-center text-center transition-all hover:border-indigo-300">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signal C</span>
          <span className="text-xs font-extrabold text-slate-900 mt-0.5">Skill Graph</span>
          <span className="text-[10px] text-slate-400">Domain Hierarchy</span>
        </div>

        {/* Node 6: Decision Trace & Rank */}
        <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col items-center text-center transition-all shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Output</span>
          <span className="text-xs font-extrabold text-indigo-950 mt-0.5">Decision Trace</span>
          <span className="text-[10px] text-indigo-600 font-bold">Verifiable Ranks</span>
        </div>
      </div>

      {/* Visual Flow Indicator */}
      <div className="mt-3 flex items-center justify-center space-x-2 text-[11px] font-medium text-slate-400">
        <span>Raw PDF</span>
        <ArrowRight className="w-3 h-3 text-indigo-400" />
        <span>Token &amp; Vector Index</span>
        <ArrowRight className="w-3 h-3 text-indigo-400" />
        <span className="text-indigo-600 font-bold">Python Deterministic Scoring</span>
        <ArrowRight className="w-3 h-3 text-indigo-400" />
        <span>Verified Evidence Quotes</span>
      </div>
    </div>
  );
};
