import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { UploadPanel } from './components/UploadPanel';
import { SummaryCards } from './components/SummaryCards';
import { RankingTable } from './components/RankingTable';
import { Top3Section } from './components/Top3Section';
import { HiddenGem } from './components/HiddenGem';
import { CandidateDetails } from './components/CandidateDetails';
import { CompareView } from './components/CompareView';
import { JDAuditModal } from './components/JDAudit';
import type { AnalysisResponse, Candidate } from './types';

export function App() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [comparePair, setComparePair] = useState<{ a: Candidate | null; b: Candidate | null } | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle interactive background tracking cursor with requestAnimationFrame
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
          const x = (e.clientX / window.innerWidth) * 100;
          const y = (e.clientY / window.innerHeight) * 100;
          containerRef.current.style.setProperty('--mouse-x', `${x.toFixed(2)}%`);
          containerRef.current.style.setProperty('--mouse-y', `${y.toFixed(2)}%`);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Upload and Analyze files
  const handleAnalyze = async (
    jdFile: File,
    resumeFiles: File[],
    weights: { keyword: number; semantic: number; graph: number }
  ) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('jd_file', jdFile);
    resumeFiles.forEach((file) => {
      formData.append('resume_files', file);
    });
    formData.append('keyword_weight', weights.keyword.toString());
    formData.append('semantic_weight', weights.semantic.toString());
    formData.append('graph_weight', weights.graph.toString());

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errDetail = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errDetail.detail || 'Analysis failed');
      }

      const result: AnalysisResponse = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Analysis failed. Check server logs.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenCompare = (candA?: Candidate, candB?: Candidate) => {
    const list = data?.ranking || [];
    setComparePair({
      a: candA || list[0] || null,
      b: candB || list[1] || null,
    });
  };

  return (
    <div ref={containerRef} className="interactive-mesh-bg min-h-screen text-slate-900 flex flex-col font-sans transition-colors duration-300">
      {/* Upgraded Header */}
      <Header
        jdAudit={data?.jd_audit || null}
        onOpenAudit={() => setShowAuditModal(true)}
        onOpenCompare={() => handleOpenCompare()}
        canCompare={Boolean(data && data.ranking.length >= 2)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center justify-between shadow-2xs animate-fade-in-up">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-900 font-black ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workspace Hero / Upload Panel */}
        <UploadPanel
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          totalAnalyzed={data?.total_candidates}
        />

        {/* Dynamic Results Area */}
        {data ? (
          <div className="animate-fade-in-up">
            {/* 1. Score Summary Metrics */}
            <SummaryCards
              summary={data.top_summary}
              onScrollToGems={() => {
                document.getElementById('hidden-gems-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. Top 3 Candidate Cards */}
            <Top3Section
              top3={data.top_3}
              candidates={data.ranking}
              onSelectCandidate={(c) => setSelectedCandidate(c)}
            />

            {/* 3. Hidden Gem Discovery */}
            <HiddenGem
              hiddenGems={data.hidden_gems}
              onSelectCandidate={(c) => setSelectedCandidate(c)}
            />

            {/* 4. Candidate Shortlist Table */}
            <RankingTable
              candidates={data.ranking}
              onSelectCandidate={(c) => setSelectedCandidate(c)}
              onComparePair={(cA, cB) => handleOpenCompare(cA, cB)}
            />
          </div>
        ) : (
          !isAnalyzing && (
            <div className="text-center py-20 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-inner border border-indigo-100">
                M
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                No shortlist generated yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Upload a job description and candidate resumes to begin your candidate evaluation.
              </p>
            </div>
          )
        )}
      </main>

      {/* Candidate Details Slide-Over Drawer */}
      {selectedCandidate && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onCompareWith={(c) => {
            const list = data?.ranking || [];
            const other = list.find((item) => item.candidate_id !== c.candidate_id) || null;
            setComparePair({ a: c, b: other });
            setSelectedCandidate(null);
          }}
        />
      )}

      {/* Compare Candidates Modal (Why A > B) */}
      {comparePair && data && (
        <CompareView
          candidates={data.ranking}
          initialA={comparePair.a}
          initialB={comparePair.b}
          onClose={() => setComparePair(null)}
        />
      )}

      {/* Job Description Quality Audit Modal */}
      {showAuditModal && (
        <JDAuditModal
          audit={data?.jd_audit || null}
          onClose={() => setShowAuditModal(false)}
        />
      )}
    </div>
  );
}

export default App;
