import { useState } from 'react';
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

  // Load Demo Data from FastAPI endpoint
  const handleLoadDemo = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('http://localhost:8000/demo-data');
      if (!res.ok) {
        throw new Error(`Failed to load demo data: ${res.statusText}`);
      }
      const result: AnalysisResponse = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error loading demo data. Ensure backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        jdAudit={data?.jd_audit || null}
        onOpenAudit={() => setShowAuditModal(true)}
        onOpenCompare={() => handleOpenCompare()}
        canCompare={Boolean(data && data.ranking.length >= 2)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-900 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload & Signal Tuning Panel */}
        <UploadPanel
          onAnalyze={handleAnalyze}
          onLoadDemo={handleLoadDemo}
          isAnalyzing={isAnalyzing}
          totalAnalyzed={data?.total_candidates}
        />

        {/* Results Area */}
        {data ? (
          <div>
            {/* 4 Top Summary Metrics */}
            <SummaryCards
              summary={data.top_summary}
              onScrollToGems={() => {
                document.getElementById('hidden-gems-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Top 3 Shortlist Explanations */}
            <Top3Section
              top3={data.top_3}
              candidates={data.ranking}
              onSelectCandidate={(c) => setSelectedCandidate(c)}
            />

            {/* Hidden Gem Showcase */}
            <HiddenGem
              hiddenGems={data.hidden_gems}
              onSelectCandidate={(c) => setSelectedCandidate(c)}
            />

            {/* Full Deterministic Candidate Rankings */}
            <RankingTable
              candidates={data.ranking}
              onSelectCandidate={(c) => setSelectedCandidate(c)}
              onComparePair={(cA, cB) => handleOpenCompare(cA, cB)}
            />
          </div>
        ) : (
          !isAnalyzing && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 font-black text-xl">
                N
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                No Candidates Evaluated Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Upload your Job Description and resumes above, or click &quot;Load Demo Hackathon Data&quot; to inspect real-time hybrid rankings with verified resume evidence.
              </p>
              <button
                onClick={handleLoadDemo}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Load Demo Hackathon Data (8 Resumes) →
              </button>
            </div>
          )
        )}
      </main>

      {/* Slide-over Candidate Evidence Drawer */}
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

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Nexora &bull; Evidence-First AI Hiring Intelligence &bull; Hackathon Edition
      </footer>
    </div>
  );
}

export default App;
