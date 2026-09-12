"""
Evidence-First Decision Trace Builder.
Combines BM25 lexical matching, SentenceTransformer embeddings, and Skill Graph relationships
to assign verified match types, extract real resume quotes, and track page numbers.
"""

from typing import Dict, Any, Tuple

MATCH_EXACT = "EXACT MATCH"
MATCH_STRONG_RELATED = "STRONG RELATED MATCH"
MATCH_TRANSFERABLE = "TRANSFERABLE MATCH"
MATCH_PARTIAL = "PARTIAL MATCH"
MATCH_NO_EVIDENCE = "NO EVIDENCE"

def clean_evidence_quote(text: str, max_chars: int = 240) -> str:
    """Format and trim quote to keep it readable and concise."""
    clean = " ".join(text.split()).strip()
    if len(clean) > max_chars:
        return clean[:max_chars].rsplit(' ', 1)[0] + "..."
    return clean

def evaluate_requirement_match(
    req_text: str,
    keyword_score: float,
    keyword_chunk: Dict[str, Any],
    semantic_score: float,
    semantic_chunk: Dict[str, Any],
    graph_score: float,
    graph_skill: str,
    graph_type: str,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Evaluates a single requirement against a candidate's resume signals.
    Computes hybrid score and selects the best verifiable evidence chunk.
    """
    if weights is None:
        weights = {"keyword": 0.30, "semantic": 0.50, "graph": 0.20}

    w_kw = weights.get("keyword", 0.30)
    w_sem = weights.get("semantic", 0.50)
    w_gr = weights.get("graph", 0.20)

    # Normalize weights just in case
    total_w = w_kw + w_sem + w_gr
    if total_w > 0:
        w_kw /= total_w
        w_sem /= total_w
        w_gr /= total_w

    hybrid_score = round(
        (w_kw * keyword_score) + 
        (w_sem * semantic_score) + 
        (w_gr * graph_score),
        3
    )

    # Determine which chunk holds the best evidence
    if semantic_score >= keyword_score:
        best_chunk = semantic_chunk
    else:
        best_chunk = keyword_chunk

    chunk_text = best_chunk.get("text", "")
    page_num = best_chunk.get("page_number", 1)
    section = best_chunk.get("section", "GENERAL")

    # Match Type Classification Logic
    req_lower = req_text.lower().strip()
    chunk_lower = chunk_text.lower()
    has_exact_keyword = req_lower in chunk_lower or any(part in chunk_lower for part in req_lower.split() if len(part) > 3)

    if (keyword_score >= 0.70 and semantic_score >= 0.65) or (has_exact_keyword and semantic_score >= 0.70):
        match_type = MATCH_EXACT
        evidence_text = f"\"{clean_evidence_quote(chunk_text)}\""
    elif graph_type == "STRONG RELATED MATCH" and (semantic_score >= 0.60 or graph_score >= 0.80):
        match_type = MATCH_STRONG_RELATED
        evidence_text = f"\"{clean_evidence_quote(chunk_text)}\" (Related skill: {graph_skill})"
    elif semantic_score >= 0.72:
        match_type = MATCH_STRONG_RELATED
        evidence_text = f"\"{clean_evidence_quote(chunk_text)}\""
    elif graph_type == "TRANSFERABLE MATCH" or semantic_score >= 0.60:
        match_type = MATCH_TRANSFERABLE
        evidence_text = f"\"{clean_evidence_quote(chunk_text)}\"" + (f" (Transferable domain: {graph_skill})" if graph_skill else "")
    elif semantic_score >= 0.42 or keyword_score >= 0.40:
        match_type = MATCH_PARTIAL
        evidence_text = f"\"{clean_evidence_quote(chunk_text)}\""
    else:
        match_type = MATCH_NO_EVIDENCE
        evidence_text = "No supporting evidence was found in the resume."
        page_num = None
        section = None
        hybrid_score = 0.0

    return {
        "requirement": req_text,
        "keyword_score": round(keyword_score, 3),
        "semantic_score": round(semantic_score, 3),
        "graph_score": round(graph_score, 3),
        "hybrid_score": round(hybrid_score, 3),
        "match_type": match_type,
        "evidence_text": evidence_text,
        "page": page_num,
        "section": section,
        "is_matched": match_type in [MATCH_EXACT, MATCH_STRONG_RELATED, MATCH_TRANSFERABLE]
    }
