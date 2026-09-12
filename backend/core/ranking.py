"""
Ranking, Scoring, Hidden Gem Detection, Top 3 Explanations, and Candidate Comparison Engine.
ALL scores are deterministic and calculated in Python.
"""

import os
import json
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv

load_dotenv()

def calculate_candidate_score(
    must_have_traces: List[Dict[str, Any]],
    nice_to_have_traces: List[Dict[str, Any]],
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Deterministic scoring formula incorporating dynamic signal weights:
    final_score = 0.50 * must_have_coverage +
                  0.05 * nice_to_have_coverage +
                  0.45 * (w_sem * semantic + w_kw * keyword + w_gr * graph)
    Normalized to 0–100.
    """
    if weights is None:
        weights = {"keyword": 0.30, "semantic": 0.50, "graph": 0.20}

    w_kw = weights.get("keyword", 0.30)
    w_sem = weights.get("semantic", 0.50)
    w_gr = weights.get("graph", 0.20)
    total_w = (w_kw + w_sem + w_gr) or 1.0

    # Distribute the 45% signal allocation according to configured weights
    kw_coeff = 0.45 * (w_kw / total_w)
    sem_coeff = 0.45 * (w_sem / total_w)
    gr_coeff = 0.45 * (w_gr / total_w)

    total_must = len(must_have_traces)
    total_nice = len(nice_to_have_traces)
    all_traces = must_have_traces + nice_to_have_traces

    # Must-have coverage
    matched_must = sum(1 for t in must_have_traces if t.get("is_matched", False))
    must_have_coverage = (matched_must / total_must) if total_must > 0 else 1.0

    # Nice-to-have coverage
    matched_nice = sum(1 for t in nice_to_have_traces if t.get("is_matched", False))
    nice_to_have_coverage = (matched_nice / total_nice) if total_nice > 0 else 1.0

    # Averages
    if all_traces:
        semantic_quality = sum(t.get("semantic_score", 0.0) for t in all_traces) / len(all_traces)
        keyword_quality = sum(t.get("keyword_score", 0.0) for t in all_traces) / len(all_traces)
        relationship_quality = sum(t.get("graph_score", 0.0) for t in all_traces) / len(all_traces)
    else:
        semantic_quality, keyword_quality, relationship_quality = 0.0, 0.0, 0.0

    # Formula calculation (0.0 to 1.0)
    raw_final = (
        0.50 * must_have_coverage +
        0.05 * nice_to_have_coverage +
        sem_coeff * semantic_quality +
        kw_coeff * keyword_quality +
        gr_coeff * relationship_quality
    )
    final_score = round(raw_final * 100.0, 1)

    # Match tier label
    if final_score >= 80.0:
        match_tier = "Strong"
    elif final_score >= 65.0:
        match_tier = "Good"
    elif final_score >= 45.0:
        match_tier = "Moderate"
    else:
        match_tier = "Low"

    return {
        "final_score": final_score,
        "must_have_matched": matched_must,
        "must_have_total": total_must,
        "must_have_coverage_pct": round(must_have_coverage * 100, 1),
        "nice_have_matched": matched_nice,
        "nice_have_total": total_nice,
        "semantic_quality_pct": round(semantic_quality * 100, 1),
        "keyword_quality_pct": round(keyword_quality * 100, 1),
        "relationship_quality_pct": round(relationship_quality * 100, 1),
        "match_tier": match_tier
    }

def detect_hidden_gem(candidate: Dict[str, Any]) -> Tuple[bool, str]:
    """
    A candidate is a Hidden Gem when:
    - High must-have coverage (>= 75%)
    - Semantic relevance exceeds or significantly offsets keyword relevance
    - Keyword score is relatively low (<= 50%)
    - Possesses strong related technology matches that keyword ATS overlooks
    """
    kw_pct = candidate.get("keyword_quality_pct", 0.0)
    sem_pct = candidate.get("semantic_quality_pct", 0.0)
    must_cov = candidate.get("must_have_coverage_pct", 0.0)
    traces = candidate.get("traces", [])

    strong_related_count = sum(
        1 for t in traces 
        if t.get("match_type") in ["STRONG RELATED MATCH", "TRANSFERABLE MATCH"]
    )

    # Overlooked candidate: High coverage + high related skills, but lower keyword frequency
    if must_cov >= 75.0 and kw_pct <= 48.0 and (sem_pct >= kw_pct or strong_related_count >= 4):
        reason = (
            f"Low keyword overlap ({kw_pct}%), but strong semantic evidence ({sem_pct}%) "
            f"and high requirement coverage ({must_cov}%) suggest this candidate could be "
            f"overlooked by a traditional keyword-only ATS."
        )
        return True, reason
    return False, ""

def generate_deterministic_explanation(candidate: Dict[str, Any], rank: int) -> str:
    """Fallback explanation generator when Groq is unavailable."""
    name = candidate.get("candidate_name", "Candidate")
    score = candidate.get("final_score", 0.0)
    matched_must = candidate.get("must_have_matched", 0)
    total_must = candidate.get("must_have_total", 0)
    sem_pct = candidate.get("semantic_quality_pct", 0.0)
    kw_pct = candidate.get("keyword_quality_pct", 0.0)

    # Find top matched requirements
    exacts = [t["requirement"] for t in candidate.get("traces", []) if t.get("match_type") == "EXACT MATCH"]
    strongs = [t["requirement"] for t in candidate.get("traces", []) if t.get("match_type") == "STRONG RELATED MATCH"]
    missing = [t["requirement"] for t in candidate.get("traces", []) if t.get("match_type") == "NO EVIDENCE"]

    summary_parts = [
        f"{name} ranks #{rank} with an overall score of {score}/100.",
        f"Demonstrates {matched_must}/{total_must} must-have requirement coverage with {sem_pct}% semantic fit and {kw_pct}% keyword relevance."
    ]

    if exacts:
        summary_parts.append(f"Strong verified exact matches in: {', '.join(exacts[:3])}.")
    if strongs:
        summary_parts.append(f"Valuable related technical capability in: {', '.join(strongs[:2])}.")
    if missing:
        summary_parts.append(f"Note: No supporting evidence found in resume for: {', '.join(missing[:2])}.")

    return " ".join(summary_parts)

def explain_top_candidates(top_candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates explanations for top 3 candidates.
    Uses Groq if available, otherwise deterministic templates.
    """
    api_key = os.getenv("GROQ_API_KEY")
    groq_available = api_key and api_key != "YOUR_KEY_HERE" and len(api_key.strip()) > 10

    results = []
    for idx, cand in enumerate(top_candidates[:3]):
        rank = idx + 1
        explanation = None

        if groq_available:
            try:
                from groq import Groq
                client = Groq(api_key=api_key)
                trace_summary = [
                    f"- {t['requirement']}: {t['match_type']} (evidence: {t['evidence_text'][:90]} on page {t['page']})"
                    for t in cand.get("traces", [])[:6]
                ]
                prompt = f"""
You are a senior technical hiring advisor. Explain concisely (3-4 sentences) why this candidate ranked #{rank}.
Use ONLY the provided evidence. DO NOT invent scores or mention facts not in the trace.

Candidate: {cand['candidate_name']}
Rank: #{rank}
Final Score: {cand['final_score']}/100
Must-Have Coverage: {cand['must_have_matched']}/{cand['must_have_total']}
Semantic Quality: {cand['semantic_quality_pct']}%
Keyword Quality: {cand['keyword_quality_pct']}%

Trace:
{chr(10).join(trace_summary)}

Give a crisp, objective recruiter explanation highlighting matched skills, evidence depth, and any no-evidence gaps.
"""
                resp = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    max_tokens=220
                )
                explanation = resp.choices[0].message.content.strip()
            except Exception:
                explanation = None

        if not explanation:
            explanation = generate_deterministic_explanation(cand, rank)

        results.append({
            "candidate_id": cand.get("candidate_id"),
            "candidate_name": cand.get("candidate_name"),
            "rank": rank,
            "final_score": cand.get("final_score"),
            "explanation": explanation
        })

    return results

def compare_candidates(candidate_a: Dict[str, Any], candidate_b: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic comparative diff: "Why Candidate A > Candidate B".
    Uses actual decision traces to build point-by-point evidence comparisons.
    """
    score_a = candidate_a.get("final_score", 0.0)
    score_b = candidate_b.get("final_score", 0.0)
    higher, lower = (candidate_a, candidate_b) if score_a >= score_b else (candidate_b, candidate_a)

    reasons = []

    # 1. Must-have coverage comparison
    must_cov_a = higher.get("must_have_matched", 0)
    must_cov_b = lower.get("must_have_matched", 0)
    must_total = higher.get("must_have_total", 0)

    if must_cov_a > must_cov_b:
        reasons.append(
            f"{higher['candidate_name']} verified {must_cov_a}/{must_total} must-have requirements "
            f"vs {lower['candidate_name']}'s {must_cov_b}/{must_total}."
        )
    elif must_cov_a == must_cov_b:
        reasons.append(
            f"Both candidates cover {must_cov_a}/{must_total} must-have requirements."
        )

    # 2. Semantic vs Keyword quality difference
    sem_diff = round(higher.get("semantic_quality_pct", 0.0) - lower.get("semantic_quality_pct", 0.0), 1)
    kw_diff = round(higher.get("keyword_quality_pct", 0.0) - lower.get("keyword_quality_pct", 0.0), 1)

    if sem_diff > 0:
        reasons.append(
            f"{higher['candidate_name']} exhibits +{sem_diff}% stronger semantic relevance across role requirements."
        )
    if kw_diff > 0:
        reasons.append(
            f"{higher['candidate_name']} matches +{kw_diff}% more verified technical keywords."
        )
    elif kw_diff < 0 and sem_diff > 0:
        reasons.append(
            f"{lower['candidate_name']} has higher keyword frequency (+{abs(kw_diff)}%), "
            f"but {higher['candidate_name']} holds deeper contextual evidence (+{sem_diff}% semantic fit)."
        )

    # 3. Requirement-by-requirement trace comparison
    traces_a = {t["requirement"]: t for t in higher.get("traces", [])}
    traces_b = {t["requirement"]: t for t in lower.get("traces", [])}

    skill_deltas = []
    for req, tr_a in traces_a.items():
        if req in traces_b:
            tr_b = traces_b[req]
            delta = round(tr_a.get("hybrid_score", 0.0) - tr_b.get("hybrid_score", 0.0), 3)
            skill_deltas.append({
                "requirement": req,
                "score_higher": tr_a.get("hybrid_score", 0.0),
                "type_higher": tr_a.get("match_type"),
                "evidence_higher": tr_a.get("evidence_text"),
                "score_lower": tr_b.get("hybrid_score", 0.0),
                "type_lower": tr_b.get("match_type"),
                "evidence_lower": tr_b.get("evidence_text"),
                "delta": delta
            })

    # Sort skills by largest positive advantage for higher candidate
    skill_deltas.sort(key=lambda x: x["delta"], reverse=True)
    top_advantage = [s for s in skill_deltas if s["delta"] > 0.15]

    for adv in top_advantage[:2]:
        reasons.append(
            f"Stronger evidence in '{adv['requirement']}': {higher['candidate_name']} has {adv['type_higher']} "
            f"({adv['score_higher']}) vs {lower['candidate_name']}'s {adv['type_lower']} ({adv['score_lower']})."
        )

    return {
        "candidate_a": candidate_a["candidate_name"],
        "score_a": score_a,
        "candidate_b": candidate_b["candidate_name"],
        "score_b": score_b,
        "winner": higher["candidate_name"],
        "score_difference": round(abs(score_a - score_b), 1),
        "why_higher_ranks_above": reasons,
        "detailed_deltas": skill_deltas
    }
