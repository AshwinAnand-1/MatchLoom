export interface RequirementTrace {
  requirement: string;
  keyword_score: number;
  semantic_score: number;
  graph_score: number;
  hybrid_score: number;
  match_type: "EXACT MATCH" | "STRONG RELATED MATCH" | "TRANSFERABLE MATCH" | "PARTIAL MATCH" | "NO EVIDENCE";
  evidence_text: string;
  page: number | null;
  section: string | null;
  category: "must_have" | "nice_to_have";
  is_matched: boolean;
}

export interface Candidate {
  candidate_id: string;
  candidate_name: string;
  filename: string;
  rank?: number;
  final_score: number;
  must_have_matched: number;
  must_have_total: number;
  must_have_coverage_pct: number;
  nice_have_matched: number;
  nice_have_total: number;
  semantic_quality_pct: number;
  keyword_quality_pct: number;
  relationship_quality_pct: number;
  match_tier: "Strong" | "Good" | "Moderate" | "Low";
  is_hidden_gem: boolean;
  hidden_gem_reason: string;
  traces: RequirementTrace[];
  error?: string | null;
}

export interface TopSummary {
  top_score: number;
  must_have_coverage: string;
  hidden_gems_count: number;
  candidates_count: number;
}

export interface Top3Explanation {
  candidate_id: string;
  candidate_name: string;
  rank: number;
  final_score: number;
  explanation: string;
}

export interface JDAudit {
  is_healthy: boolean;
  warnings: string[];
  suggestions: string[];
  must_have_count: number;
  nice_to_have_count: number;
  vague_terms: string[];
  narrow_requirements: string[];
}

export interface AnalysisResponse {
  jd_title: string;
  total_candidates: number;
  requirements: {
    must_have: Array<{ id: string; text: string; category: string; importance: number }>;
    nice_to_have: Array<{ id: string; text: string; category: string; importance: number }>;
  };
  weights_used: {
    keyword: number;
    semantic: number;
    graph: number;
  };
  top_summary: TopSummary;
  ranking: Candidate[];
  top_3: Top3Explanation[];
  hidden_gems: Candidate[];
  jd_audit: JDAudit;
}

export interface SkillDelta {
  requirement: string;
  score_higher: number;
  type_higher: string;
  evidence_higher: string;
  score_lower: number;
  type_lower: string;
  evidence_lower: string;
  delta: number;
}

export interface ComparisonResult {
  candidate_a: string;
  score_a: number;
  candidate_b: string;
  score_b: number;
  winner: string;
  score_difference: number;
  why_higher_ranks_above: string[];
  detailed_deltas: SkillDelta[];
}
