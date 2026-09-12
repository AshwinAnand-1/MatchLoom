"""
Lightweight LangGraph Orchestration for Nexora.
Linear, robust state machine coordinating PDF parsing, requirements extraction,
hybrid matching, deterministic ranking, and evidence-backed explanations.
"""

from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END

from backend.core.pdf_parser import parse_pdf
from backend.core.jd_analyzer import extract_and_audit_jd
from backend.core.keyword_matcher import BM25KeywordMatcher
from backend.core.semantic_matcher import SemanticMatcher
from backend.core.skill_graph import calculate_graph_score
from backend.core.evidence import evaluate_requirement_match
from backend.core.ranking import (
    calculate_candidate_score,
    detect_hidden_gem,
    explain_top_candidates
)

class NexoraState(TypedDict):
    jd_bytes: bytes
    jd_filename: str
    resume_files: List[Dict[str, Any]]
    weights: Dict[str, float]
    parsed_jd: Optional[Dict[str, Any]]
    parsed_resumes: Optional[List[Dict[str, Any]]]
    requirements: Optional[Dict[str, Any]]
    jd_audit: Optional[Dict[str, Any]]
    candidates_processed: Optional[List[Dict[str, Any]]]
    top_3: Optional[List[Dict[str, Any]]]
    hidden_gems: Optional[List[Dict[str, Any]]]
    top_summary: Optional[Dict[str, Any]]
    final_output: Optional[Dict[str, Any]]

def parse_documents_node(state: NexoraState) -> Dict[str, Any]:
    parsed_jd = parse_pdf(state["jd_bytes"], state["jd_filename"])
    parsed_resumes = []
    for r_file in state["resume_files"]:
        p_res = parse_pdf(r_file["bytes"], r_file["filename"])
        parsed_resumes.append(p_res)
    return {"parsed_jd": parsed_jd, "parsed_resumes": parsed_resumes}

def extract_requirements_node(state: NexoraState) -> Dict[str, Any]:
    parsed_jd = state["parsed_jd"]
    analysis = extract_and_audit_jd(parsed_jd.get("full_text", ""))
    return {
        "requirements": analysis["requirements"],
        "jd_audit": analysis["audit"]
    }

def hybrid_match_node(state: NexoraState) -> Dict[str, Any]:
    weights = state.get("weights") or {"keyword": 0.30, "semantic": 0.50, "graph": 0.20}
    requirements = state["requirements"]
    must_haves = requirements.get("must_have", [])
    nice_to_haves = requirements.get("nice_to_have", [])
    parsed_resumes = state["parsed_resumes"]

    candidates_processed = []

    for idx, res in enumerate(parsed_resumes):
        cand_id = f"cand_{idx + 1}"
        if not res.get("has_sufficient_text", False):
            candidates_processed.append({
                "candidate_id": cand_id,
                "candidate_name": res.get("candidate_name", "Candidate"),
                "filename": res.get("filename", ""),
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
                "error": res.get("error", "Could not extract sufficient text from this resume.")
            })
            continue

        chunks = res["chunks"]
        full_text = res["full_text"]

        bm25 = BM25KeywordMatcher(chunks)
        semantic = SemanticMatcher(chunks)

        must_traces = []
        nice_traces = []

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

        score_data = calculate_candidate_score(must_traces, nice_traces, weights)

        cand_obj = {
            "candidate_id": cand_id,
            "candidate_name": res["candidate_name"],
            "filename": res["filename"],
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

        is_gem, gem_reason = detect_hidden_gem(cand_obj)
        cand_obj["is_hidden_gem"] = is_gem
        cand_obj["hidden_gem_reason"] = gem_reason

        candidates_processed.append(cand_obj)

    return {"candidates_processed": candidates_processed}

def rank_candidates_node(state: NexoraState) -> Dict[str, Any]:
    cands = list(state["candidates_processed"])
    cands.sort(key=lambda c: c["final_score"], reverse=True)
    for rank_idx, c in enumerate(cands):
        c["rank"] = rank_idx + 1

    hidden_gems = [c for c in cands if c.get("is_hidden_gem")]
    top_score = cands[0]["final_score"] if cands else 0.0
    top_must_matched = cands[0]["must_have_matched"] if cands else 0
    total_must = len(state["requirements"].get("must_have", []))

    top_summary = {
        "top_score": top_score,
        "must_have_coverage": f"{top_must_matched} / {total_must}",
        "hidden_gems_count": len(hidden_gems),
        "candidates_count": len(cands)
    }

    return {
        "candidates_processed": cands,
        "hidden_gems": hidden_gems,
        "top_summary": top_summary
    }

def generate_explanations_node(state: NexoraState) -> Dict[str, Any]:
    cands = state["candidates_processed"]
    top_3 = explain_top_candidates(cands[:3])

    final_output = {
        "jd_title": state["parsed_jd"].get("candidate_name", "Job Description"),
        "total_candidates": len(cands),
        "requirements": state["requirements"],
        "weights_used": state["weights"],
        "top_summary": state["top_summary"],
        "ranking": cands,
        "top_3": top_3,
        "hidden_gems": state["hidden_gems"],
        "jd_audit": state["jd_audit"]
    }
    return {"top_3": top_3, "final_output": final_output}

def build_nexora_graph():
    """Builds and compiles the LangGraph workflow."""
    workflow = StateGraph(NexoraState)

    workflow.add_node("parse_documents", parse_documents_node)
    workflow.add_node("extract_requirements", extract_requirements_node)
    workflow.add_node("hybrid_match", hybrid_match_node)
    workflow.add_node("rank_candidates", rank_candidates_node)
    workflow.add_node("generate_explanations", generate_explanations_node)

    workflow.add_edge(START, "parse_documents")
    workflow.add_edge("parse_documents", "extract_requirements")
    workflow.add_edge("extract_requirements", "hybrid_match")
    workflow.add_edge("hybrid_match", "rank_candidates")
    workflow.add_edge("rank_candidates", "generate_explanations")
    workflow.add_edge("generate_explanations", END)

    return workflow.compile()

# Pre-compile graph instance
nexora_app = build_nexora_graph()
