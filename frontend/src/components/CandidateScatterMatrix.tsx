import React, { useState } from 'react';
import type { Candidate } from '../types';
import { Sparkles, BarChart3 } from 'lucide-react';

interface CandidateScatterMatrixProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
}

export const CandidateScatterMatrix: React.FC<CandidateScatterMatrixProps> = ({
  candidates,
  onSelectCandidate
}) => {
  const [hoveredCandidate, setHoveredCandidate] = useState<Candidate | null>(null);

  if (!candidates || candidates.length === 0) return null;

  // Chart dimensions & scaling
  const width = 520;
  const height = 320;
  const padding = 45;

  const minVal = 20;
  const maxVal = 70; // Zoom in on actual recruiter variance range (20% to 70%)

  const scaleX = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return padding + ((clamped - minVal) / (maxVal - minVal)) * (width - 2 * padding);
  };

  const scaleY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return height - padding - ((clamped - minVal) / (maxVal - minVal)) * (height - 2 * padding);
  };

  const midX = scaleX(47);
  const midY = scaleY(45);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Semantic vs. Keyword Decision Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real candidate distribution across lexical keyword overlap (X-axis) and contextual semantic fit (Y-axis).
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span className="flex items-center text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px]">
            <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
            Hidden Gem Territory
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">&bull; Click point to inspect</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 2D Scatter Quadrant SVG */}
        <div className="lg:col-span-8 relative flex justify-center">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-xl h-auto overflow-visible select-none"
          >
            {/* Quadrant Background Tints */}
            {/* Top-Left: Hidden Gem Zone */}
            <rect
              x={padding}
              y={padding}
              width={midX - padding}
              height={midY - padding}
              fill="#fef3c7"
              fillOpacity="0.3"
              rx="8"
            />
            {/* Top-Right: Prime Fit */}
            <rect
              x={midX}
              y={padding}
              width={width - padding - midX}
              height={midY - padding}
              fill="#dcfce7"
              fillOpacity="0.25"
              rx="8"
            />
            {/* Bottom-Right: Keyword Stuffer */}
            <rect
              x={midX}
              y={midY}
              width={width - padding - midX}
              height={height - padding - midY}
              fill="#ffedd5"
              fillOpacity="0.25"
              rx="8"
            />
            {/* Bottom-Left: Weak Fit */}
            <rect
              x={padding}
              y={midY}
              width={midX - padding}
              height={height - padding - midY}
              fill="#f1f5f9"
              fillOpacity="0.4"
              rx="8"
            />

            {/* Quadrant Dividing Lines */}
            <line
              x1={midX}
              y1={padding}
              x2={midX}
              y2={height - padding}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <line
              x1={padding}
              y1={midY}
              x2={width - padding}
              y2={midY}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />

            {/* Quadrant Watermark Labels */}
            <text x={padding + 10} y={padding + 18} fill="#92400e" fontSize="9" fontWeight="700" opacity="0.8">
              ✨ HIDDEN GEMS (HIGH SEMANTIC / LOW KEYWORD)
            </text>
            <text x={midX + 10} y={padding + 18} fill="#166534" fontSize="9" fontWeight="700" opacity="0.8">
              🎯 PRIME FIT (HIGH BOTH)
            </text>
            <text x={midX + 10} y={midY + 18} fill="#9a3412" fontSize="9" fontWeight="700" opacity="0.8">
              ⚠️ KEYWORD HEAVY / WEAK DEPTH
            </text>
            <text x={padding + 10} y={midY + 18} fill="#64748b" fontSize="9" fontWeight="700" opacity="0.8">
              ○ LOW OVERALL FIT
            </text>

            {/* Axes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />

            {/* Axis Labels */}
            <text
              x={width / 2}
              y={height - 10}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontWeight="700"
            >
              BM25 Keyword Relevance (%) →
            </text>
            <text
              x={-height / 2}
              y={14}
              textAnchor="middle"
              transform="rotate(-90)"
              fill="#64748b"
              fontSize="10"
              fontWeight="700"
            >
              Semantic Relevance (%) →
            </text>

            {/* Candidate Scatter Points */}
            {candidates.map((cand) => {
              const cx = scaleX(cand.keyword_quality_pct);
              const cy = scaleY(cand.semantic_quality_pct);
              const isGem = cand.is_hidden_gem;
              const isHovered = hoveredCandidate?.candidate_id === cand.candidate_id;

              return (
                <g
                  key={cand.candidate_id}
                  className="cursor-pointer transition-transform"
                  onClick={() => onSelectCandidate(cand)}
                  onMouseEnter={() => setHoveredCandidate(cand)}
                  onMouseLeave={() => setHoveredCandidate(null)}
                >
                  {/* Outer Pulsing Aura for Hidden Gems */}
                  {isGem && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="12"
                      fill="#f59e0b"
                      opacity="0.25"
                      className="animate-ping"
                      style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: '2.5s' }}
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? "8" : isGem ? "7" : "6"}
                    fill={isGem ? "#f59e0b" : cand.rank === 1 ? "#10b981" : "#6366f1"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-xs transition-all"
                  />

                  {/* Rank Label on node */}
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize="9"
                    fontWeight="800"
                    className="pointer-events-none"
                  >
                    #{cand.rank}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Candidate Inspection Card for Hovered or Top Point */}
        <div className="lg:col-span-4 bg-slate-50/80 rounded-xl p-4 border border-slate-200">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            {hoveredCandidate ? "Inspecting Node" : "Interactive Legend"}
          </span>

          {hoveredCandidate ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-extrabold text-slate-900">
                  #{hoveredCandidate.rank} {hoveredCandidate.candidate_name}
                </span>
                <span className="text-xs font-black text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                  {hoveredCandidate.final_score} pts
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                <div className="flex justify-between">
                  <span>Semantic Relevance:</span>
                  <span className="font-bold text-slate-800">{hoveredCandidate.semantic_quality_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Keyword Overlap:</span>
                  <span className="font-bold text-slate-800">{hoveredCandidate.keyword_quality_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Must-Have Coverage:</span>
                  <span className="font-bold text-slate-800">
                    {hoveredCandidate.must_have_matched}/{hoveredCandidate.must_have_total}
                  </span>
                </div>
              </div>

              {hoveredCandidate.is_hidden_gem && (
                <div className="p-2 rounded-lg bg-amber-100/70 border border-amber-200 text-[11px] text-amber-900 font-medium mb-3">
                  ✨ High semantic fit despite lower keyword overlap.
                </div>
              )}

              <button
                onClick={() => onSelectCandidate(hoveredCandidate)}
                className="w-full text-center py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              >
                Inspect Full Evidence →
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 space-y-2">
              <p>
                Hover over any candidate node to inspect their position on the lexical vs semantic spectrum.
              </p>
              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span><strong>Rank #1 Top Candidate</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span><strong>Hidden Gem Candidate</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                  <span><strong>Standard Candidate</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
