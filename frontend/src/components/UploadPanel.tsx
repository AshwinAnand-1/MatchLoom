import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Settings2, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface UploadPanelProps {
  onAnalyze: (jdFile: File, resumeFiles: File[], weights: { keyword: number; semantic: number; graph: number }) => void;
  onLoadDemo: () => void;
  isAnalyzing: boolean;
  totalAnalyzed?: number;
}

const ANALYSIS_STEPS = [
  "Parsing resumes and job description...",
  "Extracting requirements & running quality audit...",
  "Computing BM25 lexical keyword scores...",
  "Generating SentenceTransformer embeddings...",
  "Traversing skill relationship graph...",
  "Compiling evidence quotes & deterministic ranking..."
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
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Cycle through animation steps while analyzing
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleJdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleResumesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumeFiles(Array.from(e.target.files));
    }
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Candidate Evaluation Console</span>
            {totalAnalyzed !== undefined && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {totalAnalyzed} Candidates Analyzed
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload a Job Description PDF and candidate resumes to compute deterministic hybrid evidence ranking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLoadDemo}
            disabled={isAnalyzing}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Load Demo Hackathon Data (8 Resumes)
          </button>

          <button
            type="button"
            onClick={() => setShowWeights(!showWeights)}
            className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shadow-2xs cursor-pointer ${
              showWeights
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5 mr-1.5" />
            Signal Weights
          </button>
        </div>
      </div>

      {/* Signal Weights Configuration Panel */}
      {showWeights && (
        <div className="my-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Hybrid Matching Weights Configuration
            </span>
            <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Proves both signals genuinely alter scoring
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>BM25 Keyword Weight</span>
                <span className="text-indigo-600 font-bold">{Math.round(keywordWeight * 100)}%</span>
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
              <p className="text-[10px] text-slate-400 mt-1">Lexical exact token presence in resume chunks</p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Semantic Embeddings Weight</span>
                <span className="text-indigo-600 font-bold">{Math.round(semanticWeight * 100)}%</span>
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
              <p className="text-[10px] text-slate-400 mt-1">MiniLM-L6-v2 deep cosine similarity on requirements</p>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Skill Graph Weight</span>
                <span className="text-indigo-600 font-bold">{Math.round(graphWeight * 100)}%</span>
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
              <p className="text-[10px] text-slate-400 mt-1">Direct technology hierarchy & transferable skills</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* JD Upload Box */}
        <label className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          jdFile ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
        }`}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleJdChange}
            className="sr-only"
            disabled={isAnalyzing}
          />
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-600">
            {jdFile ? <CheckCircle2 className="w-5 h-5 text-indigo-600" /> : <FileText className="w-5 h-5" />}
          </div>
          <p className="text-xs font-bold text-slate-800">
            {jdFile ? jdFile.name : "Select Job Description (PDF)"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {jdFile ? `${(jdFile.size / 1024).toFixed(1)} KB` : "Click or drag & drop 1 JD PDF"}
          </p>
        </label>

        {/* Resumes Upload Box */}
        <label className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          resumeFiles.length > 0 ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
        }`}>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleResumesChange}
            className="sr-only"
            disabled={isAnalyzing}
          />
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-600">
            {resumeFiles.length > 0 ? <CheckCircle2 className="w-5 h-5 text-indigo-600" /> : <UploadCloud className="w-5 h-5" />}
          </div>
          <p className="text-xs font-bold text-slate-800">
            {resumeFiles.length > 0 ? `${resumeFiles.length} resumes selected` : "Select Resume PDFs"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {resumeFiles.length > 0 ? "Ready for hybrid ranking analysis" : "Upload 8 to 18 PDF files"}
          </p>
        </label>
      </div>

      {/* Action Footer & Progress State */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          {isAnalyzing ? (
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs font-medium text-slate-700">
                {ANALYSIS_STEPS[currentStepIdx]}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              {jdFile && resumeFiles.length > 0 ? (
                <span className="text-emerald-600 font-medium">Ready: 1 JD and {resumeFiles.length} resumes prepared.</span>
              ) : (
                <span>Upload files or click &quot;Load Demo Hackathon Data&quot; to begin.</span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing || !jdFile || resumeFiles.length === 0}
          className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
            !isAnalyzing && jdFile && resumeFiles.length > 0
              ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 cursor-pointer"
              : "bg-slate-300 cursor-not-allowed text-slate-500"
          }`}
        >
          {isAnalyzing ? "Processing Pipelines..." : "Analyze Candidates →"}
        </button>
      </div>
    </div>
  );
};
