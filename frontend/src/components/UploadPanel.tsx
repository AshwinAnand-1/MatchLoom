import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, FileText, Sparkles, CheckCircle2, 
  RefreshCw, X, ArrowRight, Sliders, Check
} from 'lucide-react';

interface UploadPanelProps {
  onAnalyze: (jdFile: File, resumeFiles: File[], weights: { keyword: number; semantic: number; graph: number }) => void;
  onLoadDemo: () => void;
  isAnalyzing: boolean;
  totalAnalyzed?: number;
}

const ANALYSIS_STAGES = [
  { title: "Parsing Documents", desc: "PyMuPDF extracting page chunks & structural metadata" },
  { title: "Extracting Requirements", desc: "Isolating must-haves, nice-to-haves & running JD audit" },
  { title: "BM25 Keyword Indexing", desc: "Building term-frequency matrices over resume paragraphs" },
  { title: "MiniLM Semantic Matching", desc: "Computing 384-dim dense embeddings & cosine similarity" },
  { title: "Skill Graph Traversal", desc: "Matching transferable capabilities & domain hierarchies" },
  { title: "Compiling Evidence & Trace", desc: "Calculating deterministic candidate scores & ranks" },
];

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onAnalyze,
  onLoadDemo,
  isAnalyzing,
  totalAnalyzed
}) => {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [showWeights, setShowWeights] = useState(false);
  const [keywordWeight, setKeywordWeight] = useState(0.30);
  const [semanticWeight, setSemanticWeight] = useState(0.50);
  const [graphWeight, setGraphWeight] = useState(0.20);
  const [stageIdx, setStageIdx] = useState(0);

  // Cycle through animation steps while analyzing
  useEffect(() => {
    if (!isAnalyzing) {
      setStageIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setStageIdx((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 850);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleJdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleResumesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incoming = Array.from(e.target.files);
      setResumeFiles((prev) => [...prev, ...incoming]);
    }
  };

  const removeResumeFile = (indexToRemove: number) => {
    setResumeFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAnalyzeClick = () => {
    if (!jdFile || resumeFiles.length === 0) return;
    onAnalyze(jdFile, resumeFiles, {
      keyword: keywordWeight,
      semantic: semanticWeight,
      graph: graphWeight
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 lg:p-8 mb-8 relative overflow-hidden transition-all">
      {/* Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/80">
              Recruiter Cockpit
            </span>
            {totalAnalyzed !== undefined && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {totalAnalyzed} Candidates Ranked
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Build Your Shortlist
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload role criteria and candidate resumes to compute dual-signal hybrid ranking backed by verified evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLoadDemo}
            disabled={isAnalyzing}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200 hover:border-emerald-300 hover:shadow-glow-emerald hover:-translate-y-0.5 transition-all duration-200 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600 animate-pulse" />
            Load Demo Hackathon Data (8 Resumes)
          </button>

          <button
            type="button"
            onClick={() => setShowWeights(!showWeights)}
            className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 shadow-2xs cursor-pointer ${
              showWeights
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 mr-1.5" />
            Signal Weights
          </button>
        </div>
      </div>

      {/* Visual 3-Step Flow Ribbon */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60">
        <div className={`p-3 rounded-xl flex items-center space-x-3 transition-colors ${jdFile ? "bg-white shadow-2xs border border-slate-200/70" : ""}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
            jdFile ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
          }`}>
            {jdFile ? <Check className="w-4 h-4" /> : "01"}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Step 01</span>
            <span className="text-xs font-extrabold text-slate-800">Job Description</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl flex items-center space-x-3 transition-colors ${resumeFiles.length > 0 ? "bg-white shadow-2xs border border-slate-200/70" : ""}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
            resumeFiles.length > 0 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
          }`}>
            {resumeFiles.length > 0 ? <Check className="w-4 h-4" /> : "02"}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Step 02</span>
            <span className="text-xs font-extrabold text-slate-800">
              Candidate Resumes {resumeFiles.length > 0 && `(${resumeFiles.length})`}
            </span>
          </div>
        </div>

        <div className={`p-3 rounded-xl flex items-center space-x-3 transition-colors ${totalAnalyzed ? "bg-white shadow-2xs border border-slate-200/70" : ""}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
            totalAnalyzed ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
          }`}>
            03
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Step 03</span>
            <span className="text-xs font-extrabold text-slate-800">Evidence Ranking</span>
          </div>
        </div>
      </div>

      {/* Signal Weights Configuration Accordion */}
      {showWeights && (
        <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-slate-50 border border-indigo-200/80 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Dynamic Signal Weighting
            </span>
            <span className="text-[11px] text-indigo-700 font-bold bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
              Live Mathematical Tuning
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* BM25 Slider */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-100">
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>BM25 Keyword Weight</span>
                <span className="text-indigo-600 font-extrabold">{Math.round(keywordWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={keywordWeight}
                onChange={(e) => setKeywordWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                Exact lexical token presence in segmented resume chunks
              </p>
            </div>

            {/* Semantic Slider */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-100">
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>SentenceTransformers Weight</span>
                <span className="text-indigo-600 font-extrabold">{Math.round(semanticWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.85"
                step="0.05"
                value={semanticWeight}
                onChange={(e) => setSemanticWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                all-MiniLM-L6-v2 deep cosine similarity on requirement context
              </p>
            </div>

            {/* Graph Slider */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-100">
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Skill Graph Weight</span>
                <span className="text-indigo-600 font-extrabold">{Math.round(graphWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.50"
                step="0.05"
                value={graphWeight}
                onChange={(e) => setGraphWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                Technology taxonomy hierarchy and transferable skills
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* Step 1: JD Box */}
        <label className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          jdFile 
            ? 'border-emerald-400 bg-emerald-50/20' 
            : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/60'
        }`}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleJdChange}
            className="sr-only"
            disabled={isAnalyzing}
          />
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${
            jdFile ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
          }`}>
            {jdFile ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <FileText className="w-6 h-6" />}
          </div>
          <span className="text-xs font-black text-slate-900 text-center">
            {jdFile ? `✓ ${jdFile.name}` : "Select Job Description (PDF)"}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">
            {jdFile ? `${(jdFile.size / 1024).toFixed(1)} KB &bull; Click to replace` : "Click or drag & drop 1 Job Description PDF"}
          </span>
        </label>

        {/* Step 2: Resumes Box */}
        <label className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          resumeFiles.length > 0 
            ? 'border-indigo-400 bg-indigo-50/20' 
            : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/60'
        }`}>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleResumesChange}
            className="sr-only"
            disabled={isAnalyzing}
          />
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${
            resumeFiles.length > 0 ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
          }`}>
            {resumeFiles.length > 0 ? <CheckCircle2 className="w-6 h-6 text-indigo-600" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <span className="text-xs font-black text-slate-900 text-center">
            {resumeFiles.length > 0 ? `${resumeFiles.length} Resumes Selected` : "Select Candidate Resumes (PDFs)"}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">
            {resumeFiles.length > 0 ? "Click to add more PDFs" : "Upload 8 to 18 resume PDFs"}
          </span>
        </label>
      </div>

      {/* Selected Resumes File Chips Preview */}
      {resumeFiles.length > 0 && (
        <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
              Selected Files ({resumeFiles.length})
            </span>
            <button
              type="button"
              onClick={() => setResumeFiles([])}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
            {resumeFiles.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 shadow-2xs"
              >
                <FileText className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                <span className="truncate max-w-[140px]">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeResumeFile(idx);
                  }}
                  className="ml-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Stage Animated Analysis Sequence */}
      {isAnalyzing && (
        <div className="mt-6 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-3">
            <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
            <div>
              <span className="text-xs font-black text-indigo-950 block">
                {ANALYSIS_STAGES[stageIdx].title}
              </span>
              <span className="text-[11px] text-indigo-700">
                {ANALYSIS_STAGES[stageIdx].desc}
              </span>
            </div>
          </div>

          <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((stageIdx + 1) / ANALYSIS_STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Primary CTA Footer */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          {jdFile && resumeFiles.length > 0 ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Ready: 1 Job Description and {resumeFiles.length} candidate resumes staged.
            </span>
          ) : (
            <span>Staged files will be processed through our tri-signal ranking engine.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing || !jdFile || resumeFiles.length === 0}
          className={`relative group inline-flex items-center justify-center px-6 py-3 rounded-2xl text-xs font-extrabold text-white transition-all duration-200 shadow-md ${
            !isAnalyzing && jdFile && resumeFiles.length > 0
              ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-glow-indigo hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
          }`}
        >
          <span>{isAnalyzing ? "Processing Candidates..." : "Analyze Candidates →"}</span>
          {!isAnalyzing && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};
