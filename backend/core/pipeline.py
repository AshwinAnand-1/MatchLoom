"""
Core Pipeline Coordinator for Nexora.
Runs end-to-end extraction, matching, deterministic scoring, and evidence compilation.
"""

from typing import List, Dict, Any, Optional
from backend.core.pdf_parser import parse_pdf
from backend.core.jd_analyzer import extract_and_audit_jd
from backend.core.keyword_matcher import BM25KeywordMatcher
from backend.core.semantic_matcher import SemanticMatcher
from backend.core.skill_graph import calculate_graph_score
from backend.core.evidence import evaluate_requirement_match
from backend.core.ranking import (
    calculate_candidate_score,
    detect_hidden_gem,
    explain_top_candidates,
    compare_candidates
)

def run_nexora_pipeline(
    jd_bytes: bytes,
    jd_filename: str,
    resume_files: List[Dict[str, Any]],  # list of {"filename": str, "bytes": bytes}
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Executes the entire Nexora matching and ranking pipeline.
    """
    if weights is None:
        weights = {"keyword": 0.30, "semantic": 0.50, "graph": 0.20}

    # 1. Parse Job Description
    parsed_jd = parse_pdf(jd_bytes, jd_filename)
    jd_analysis = extract_and_audit_jd(parsed_jd["full_text"])
    requirements = jd_analysis["requirements"]
    jd_audit = jd_analysis["audit"]

    must_haves = requirements.get("must_have", [])
    nice_to_haves = requirements.get("nice_to_have", [])

    candidates_processed = []

    # 2. Process each Resume
    for idx, r_file in enumerate(resume_files):
        cand_id = f"cand_{idx + 1}"
        parsed_resume = parse_pdf(r_file["bytes"], r_file["filename"])

        if not parsed_resume["has_sufficient_text"]:
            # Candidate with unextractable or empty resume
            candidates_processed.append({
                "candidate_id": cand_id,
                "candidate_name": parsed_resume["candidate_name"],
                "filename": r_file["filename"],
                "final_score": 0.0,
                "must_have_matched": 0,
                "must_have_total": len(must_haves),
                "must_have_coverage_pct": 0.0,
                "semantic_quality_pct": 0.0,
                "keyword_quality_pct": 0.0,
                "relationship_quality_pct": 0.0,
                "match_tier": "Low",
                "is_hidden_gem": False,
                "hidden_gem_reason": "",
                "traces": [],
                "error": parsed_resume["error"]
            })
            continue

        chunks = parsed_resume["chunks"]
        full_text = parsed_resume["full_text"]

        # Initialize matchers
        bm25 = BM25KeywordMatcher(chunks)
        semantic = SemanticMatcher(chunks)

        must_traces = []
        nice_traces = []

        # Match Must-Haves
        for req in must_haves:
            req_text = req["text"]
            kw_score, kw_chunk = bm25.match_requirement(req_text)
            sem_score, sem_chunk = semantic.match_requirement(req_text)
            gr_score, gr_skill, gr_type = calculate_graph_score(req_text, full_text)

            trace = evaluate_requirement_match(
                req_text=req_text,
                keyword_score=kw_score,
                keyword_chunk=kw_chunk,
                semantic_score=sem_score,
                semantic_chunk=sem_chunk,
                graph_score=gr_score,
                graph_skill=gr_skill,
                graph_type=gr_type,
                weights=weights
            )
            trace["category"] = "must_have"
            must_traces.append(trace)

        # Match Nice-to-Haves
        for req in nice_to_haves:
            req_text = req["text"]
            kw_score, kw_chunk = bm25.match_requirement(req_text)
            sem_score, sem_chunk = semantic.match_requirement(req_text)
            gr_score, gr_skill, gr_type = calculate_graph_score(req_text, full_text)

            trace = evaluate_requirement_match(
                req_text=req_text,
                keyword_score=kw_score,
                keyword_chunk=kw_chunk,
                semantic_score=sem_score,
                semantic_chunk=sem_chunk,
                graph_score=gr_score,
                graph_skill=gr_skill,
                graph_type=gr_type,
                weights=weights
            )
            trace["category"] = "nice_to_have"
            nice_traces.append(trace)

        # Calculate final deterministic score
        score_data = calculate_candidate_score(must_traces, nice_traces, weights)

        candidate_obj = {
            "candidate_id": cand_id,
            "candidate_name": parsed_resume["candidate_name"],
            "filename": r_file["filename"],
            "final_score": score_data["final_score"],
            "must_have_matched": score_data["must_have_matched"],
            "must_have_total": score_data["must_have_total"],
            "must_have_coverage_pct": score_data["must_have_coverage_pct"],
            "nice_have_matched": score_data["nice_have_matched"],
            "nice_have_total": score_data["nice_have_total"],
            "semantic_quality_pct": score_data["semantic_quality_pct"],
            "keyword_quality_pct": score_data["keyword_quality_pct"],
            "relationship_quality_pct": score_data["relationship_quality_pct"],
            "match_tier": score_data["match_tier"],
            "traces": must_traces + nice_traces,
            "error": None
        }

        # Check Hidden Gem condition
        is_gem, gem_reason = detect_hidden_gem(candidate_obj)
        candidate_obj["is_hidden_gem"] = is_gem
        candidate_obj["hidden_gem_reason"] = gem_reason

        candidates_processed.append(candidate_obj)

    # 3. Sort candidates deterministically
    candidates_processed.sort(key=lambda c: c["final_score"], reverse=True)
    for rank_idx, cand in enumerate(candidates_processed):
        cand["rank"] = rank_idx + 1

    # 4. Generate Top 3 explanations
    top_3_explanations = explain_top_candidates(candidates_processed[:3])

    # 5. Extract summary metrics
    hidden_gems = [c for c in candidates_processed if c.get("is_hidden_gem")]
    top_score = candidates_processed[0]["final_score"] if candidates_processed else 0.0
    top_must_matched = candidates_processed[0]["must_have_matched"] if candidates_processed else 0
    total_must = len(must_haves)

    return {
        "jd_title": parsed_jd.get("candidate_name", "Job Description"),
        "total_candidates": len(candidates_processed),
        "requirements": requirements,
        "weights_used": weights,
        "top_summary": {
            "top_score": top_score,
            "must_have_coverage": f"{top_must_matched} / {total_must}",
            "hidden_gems_count": len(hidden_gems),
            "candidates_count": len(candidates_processed)
        },
        "ranking": candidates_processed,
        "top_3": top_3_explanations,
        "hidden_gems": hidden_gems,
        "jd_audit": jd_audit
    }
