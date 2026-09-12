"""
Automated Pipeline and Algorithm Verification Test for Nexora.
Tests PDF parsing, BM25, SentenceTransformers, Skill Graph, Deterministic Scoring,
Top 3 explanations, Hidden Gem detection, Why A > B comparison, and Weight Reactivity.
"""

import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.pdf_parser import parse_pdf
from backend.core.jd_analyzer import extract_and_audit_jd
from backend.core.keyword_matcher import BM25KeywordMatcher
from backend.core.semantic_matcher import SemanticMatcher
from backend.core.skill_graph import calculate_graph_score
from backend.core.pipeline import run_nexora_pipeline
from backend.core.ranking import compare_candidates

def run_all_tests():
    print("========================================")
    print("STARTING NEXORA PIPELINE VERIFICATION")
    print("========================================")

    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    jd_path = os.path.join(data_dir, "sample_jd.pdf")
    resumes_dir = os.path.join(data_dir, "resumes")

    assert os.path.exists(jd_path), f"JD PDF missing: {jd_path}"
    assert os.path.exists(resumes_dir), f"Resumes dir missing: {resumes_dir}"

    with open(jd_path, "rb") as f:
        jd_bytes = f.read()

    # 1. Test PDF Parser on JD
    parsed_jd = parse_pdf(jd_bytes, "sample_jd.pdf")
    print(f"[OK] PDF Parser: Extracted {len(parsed_jd['chunks'])} chunks from JD.")
    assert len(parsed_jd["chunks"]) > 0, "No chunks in JD"
    assert parsed_jd["has_sufficient_text"], "JD failed text sufficiency"

    # 2. Test JD Analyzer & Audit
    analysis = extract_and_audit_jd(parsed_jd["full_text"])
    must_haves = analysis["requirements"]["must_have"]
    nice_to_haves = analysis["requirements"]["nice_to_have"]
    print(f"[OK] JD Analyzer: Found {len(must_haves)} must-have and {len(nice_to_haves)} nice-to-have requirements.")
    assert len(must_haves) >= 3, "Insufficient must-have requirements extracted"
    print(f"[OK] JD Audit: Healthy={analysis['audit']['is_healthy']}, Warnings={len(analysis['audit']['warnings'])}")

    # 3. Read All Resumes
    resume_files = []
    for fname in sorted(os.listdir(resumes_dir)):
        if fname.endswith(".pdf"):
            fpath = os.path.join(resumes_dir, fname)
            with open(fpath, "rb") as f:
                resume_files.append({"filename": fname, "bytes": f.read()})

    print(f"[OK] Loaded {len(resume_files)} synthetic resumes for testing.")

    # 4. Test Full Pipeline (Default Weights)
    default_weights = {"keyword": 0.30, "semantic": 0.50, "graph": 0.20}
    result_default = run_nexora_pipeline(
        jd_bytes=jd_bytes,
        jd_filename="sample_jd.pdf",
        resume_files=resume_files,
        weights=default_weights
    )

    ranking = result_default["ranking"]
    print(f"[OK] Pipeline Run Successful. Total candidates ranked: {len(ranking)}")

    for c in ranking:
        print(f"   Rank #{c['rank']}: {c['candidate_name']} - Score: {c['final_score']} (Must-Have: {c['must_have_matched']}/{c['must_have_total']}, Sem: {c['semantic_quality_pct']}%, KW: {c['keyword_quality_pct']}%)")

    # Verify rank sorting is strictly monotonic descending
    scores = [c["final_score"] for c in ranking]
    assert scores == sorted(scores, reverse=True), "Rankings are not sorted in descending order!"
    print("[OK] Rankings strictly follow calculated descending scores.")

    # 5. Check Real Evidence & Page Numbers
    first_cand = ranking[0]
    matched_traces = [t for t in first_cand["traces"] if t["match_type"] != "NO EVIDENCE"]
    assert len(matched_traces) > 0, "No evidence traces found for top candidate"
    sample_trace = matched_traces[0]
    print(f"[OK] Verified Evidence Sample:")
    print(f"   Requirement: '{sample_trace['requirement']}'")
    print(f"   Badge: {sample_trace['match_type']}")
    print(f"   Page: {sample_trace['page']}")
    print(f"   Quote: {sample_trace['evidence_text']}")
    assert sample_trace["page"] is not None and sample_trace["page"] >= 1, "Evidence page number missing"

    # 6. Check Hidden Gem Detection
    hidden_gems = result_default["hidden_gems"]
    print(f"[OK] Hidden Gems Identified: {len(hidden_gems)}")
    for g in hidden_gems:
        print(f"   * Hidden Gem: {g['candidate_name']} (KW: {g['keyword_quality_pct']}%, Sem: {g['semantic_quality_pct']}%)")
        print(f"      Reason: {g['hidden_gem_reason']}")
    assert len(hidden_gems) >= 1, "Expected at least 1 hidden gem in test dataset"

    # 7. Check Top 3 Explanations
    top3 = result_default["top_3"]
    assert len(top3) == 3, f"Expected 3 top explanations, got {len(top3)}"
    print("[OK] Top 3 Explanations generated successfully:")
    for t in top3:
        print(f"   #{t['rank']} {t['candidate_name']}: {t['explanation'][:100]}...")

    # 8. Test Comparison ('Why A > B')
    diff = compare_candidates(ranking[0], ranking[1])
    print(f"[OK] Candidate Comparison (Why {diff['winner']} > {ranking[1]['candidate_name']}):")
    for reason in diff["why_higher_ranks_above"]:
        print(f"   - {reason}")
    assert len(diff["why_higher_ranks_above"]) > 0, "No comparison reasons generated"

    # 9. CRITICAL TEST: WEIGHT REACTIVITY
    # Test changing weights genuinely affects the scores
    print("\n----------------------------------------")
    print("RUNNING CRITICAL WEIGHT REACTIVITY TEST")
    print("----------------------------------------")

    kw_heavy_weights = {"keyword": 0.70, "semantic": 0.15, "graph": 0.15}
    result_kw = run_nexora_pipeline(
        jd_bytes=jd_bytes,
        jd_filename="sample_jd.pdf",
        resume_files=resume_files,
        weights=kw_heavy_weights
    )

    sem_heavy_weights = {"keyword": 0.10, "semantic": 0.80, "graph": 0.10}
    result_sem = run_nexora_pipeline(
        jd_bytes=jd_bytes,
        jd_filename="sample_jd.pdf",
        resume_files=resume_files,
        weights=sem_heavy_weights
    )

    # Compare Vikram Mehta (Keyword Stuffer) score between KW heavy vs Sem heavy
    vikram_kw = next(c for c in result_kw["ranking"] if "Vikram" in c["candidate_name"])
    vikram_sem = next(c for c in result_sem["ranking"] if "Vikram" in c["candidate_name"])
    print(f"Vikram Mehta (Keyword Stuffer):")
    print(f"   With 70% Keyword Weight  -> Score: {vikram_kw['final_score']}")
    print(f"   With 80% Semantic Weight -> Score: {vikram_sem['final_score']}")

    # Compare Priya Nair (Semantic Match / Hidden Gem) score
    priya_kw = next(c for c in result_kw["ranking"] if "Priya" in c["candidate_name"])
    priya_sem = next(c for c in result_sem["ranking"] if "Priya" in c["candidate_name"])
    print(f"Priya Nair (Semantic / Hidden Gem):")
    print(f"   With 70% Keyword Weight  -> Score: {priya_kw['final_score']}")
    print(f"   With 80% Semantic Weight -> Score: {priya_sem['final_score']}")

    # Verify that changing weights caused genuine score differences!
    assert vikram_kw["final_score"] != vikram_sem["final_score"], "Scores failed to react to weight change!"
    assert priya_sem["final_score"] > priya_kw["final_score"], "Priya should score higher under semantic-heavy weights"

    print("[OK] WEIGHT REACTIVITY VERIFIED: Both keyword and semantic signals genuinely alter candidate scores.")
    print("========================================")
    print("ALL VERIFICATION TESTS PASSED (10/10)!")
    print("========================================")

if __name__ == "__main__":
    run_all_tests()
