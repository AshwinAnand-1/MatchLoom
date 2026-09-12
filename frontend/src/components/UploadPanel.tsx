import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, 
  RefreshCw, X, ArrowRight, Check
} from 'lucide-react';

interface UploadPanelProps {
  onAnalyze: (jdFile: File, resumeFiles: File[], weights: { keyword: number; semantic: number; graph: number }) => void;
  isAnalyzing: boolean;
  totalAnalyzed?: number;
}

const PRODUCT_ANALYSIS_STAGES = [
  { title: "Analyzing candidate resumes...", desc: "Reading job requirements and candidate profiles" },
  { title: "Understanding role requirements...", desc: "Isolating core qualifications and expectations" },
  { title: "Reviewing candidate experience...", desc: "Evaluating projects, depth of experience, and skills" },
  { title: "Finding relevant evidence...", desc: "Verifying genuine project work and accomplishments" },
  { title: "Building your shortlist...", desc: "Compiling ranked candidates and evidence-backed profiles" },
];

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onAnalyze,
  isAnalyzing,
  totalAnalyzed
}) => {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [stageIdx, setStageIdx] = useState(0);

  // Cycle through recruiter-friendly animation steps while analyzing
  useEffect(() => {
    if (!isAnalyzing) {
      setStageIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setStageIdx((prev) => (prev < PRODUCT_ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 1000);
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
    // Deliver optimal production default weights silently in the background
    onAnalyze(jdFile, resumeFiles, {
      keyword: 0.30,
      semantic: 0.50,
      graph: 0.20
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 lg:p-8 mb-8 relative overflow-hidden transition-all">
      {/* Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/80">
              Role Workspace
            </span>
            {totalAnalyzed !== undefined && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {totalAnalyzed} Candidates Ranked
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Shortlist Candidates for Role
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your job description and applicant resumes to generate an evidence-backed candidate ranking.
          </p>
        </div>
      </div>

      {/* Upload Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Step 1: JD Box */}
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
            1. Job Description
          </span>
          <label className={`group relative flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 min-h-[160px] ${
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
              {jdFile ? <Check className="w-6 h-6 text-emerald-600" /> : <FileText className="w-6 h-6" />}
            </div>
            <span className="text-xs font-black text-slate-900 text-center">
              {jdFile ? `✓ ${jdFile.name}` : "Upload Job Description (PDF)"}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {jdFile ? `${(jdFile.size / 1024).toFixed(1)} KB • Click to replace` : "Click or drag & drop role description PDF"}
            </span>
          </label>
        </div>

        {/* Step 2: Resumes Box */}
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
            2. Candidate Resumes
          </span>
          <label className={`group relative flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 min-h-[160px] ${
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
              {resumeFiles.length > 0 ? <Check className="w-6 h-6 text-indigo-600" /> : <UploadCloud className="w-6 h-6" />}
            </div>
            <span className="text-xs font-black text-slate-900 text-center">
              {resumeFiles.length > 0 ? `${resumeFiles.length} Resumes Selected` : "Upload Candidate Resumes (PDFs)"}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {resumeFiles.length > 0 ? "Click to add more PDFs" : "Upload applicant resume PDFs"}
            </span>
          </label>
        </div>
      </div>

      {/* Selected Resumes File Chips Preview */}
      {resumeFiles.length > 0 && (
        <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
              Selected Resumes ({resumeFiles.length})
            </span>
            <button
              type="button"
              onClick={() => setResumeFiles([])}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
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
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeResumeFile(idx);
                  }}
                  className="ml-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Product-Level Animated Analysis Sequence */}
      {isAnalyzing && (
        <div className="mt-6 p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-3">
            <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
            <div>
              <span className="text-xs font-black text-indigo-950 block">
                {PRODUCT_ANALYSIS_STAGES[stageIdx].title}
              </span>
              <span className="text-[11px] text-indigo-700">
                {PRODUCT_ANALYSIS_STAGES[stageIdx].desc}
              </span>
            </div>
          </div>

          <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${((stageIdx + 1) / PRODUCT_ANALYSIS_STAGES.length) * 100}%` }}
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
              Ready: 1 Job Description and {resumeFiles.length} candidate resumes selected.
            </span>
          ) : (
            <span>Attach a role description and candidate resumes to begin evaluation.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing || !jdFile || resumeFiles.length === 0}
          className={`relative group inline-flex items-center justify-center px-7 py-3 rounded-2xl text-xs font-extrabold text-white transition-all duration-200 shadow-md ${
            !isAnalyzing && jdFile && resumeFiles.length > 0
              ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-glow-indigo hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
          }`}
        >
          <span>{isAnalyzing ? "Analyzing Candidates..." : "Analyze Candidates →"}</span>
          {!isAnalyzing && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};
