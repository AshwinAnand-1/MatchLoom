# Nexora — Project Summary & Verification Record

**Project:** Nexora — Evidence-First AI Hiring Intelligence  
**Problem:** Smart Shortlisting Engine — Rank Resumes Against a Job Description  
**Release:** Emergency 2-Hour Hackathon MVP  

---

## 1. Architectural Summary

Nexora replaces opaque, hallucinated ATS scoring with an **evidence-grounded hybrid matching engine**. It calculates transparent candidate scores via Python code by blending lexical token retrieval (BM25), dense embedding cosine similarity (`all-MiniLM-L6-v2`), and domain skill relationships.

```
                  ┌───────────────────────────────┐
                  │       Job Description         │
                  └──────────────┬────────────────┘
                                 │
                     PyMuPDF & Requirement Parser
                                 │
                  ┌──────────────┴────────────────┐
                  ▼                               ▼
            Must-Haves                      Nice-To-Haves
                  │                               │
                  └──────────────┬────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
[ BM25 Lexical ]      [ MiniLM Embeddings ]        [ Skill Graph ]
  Token frequency        Cosine similarity           Domain hierarchy
  over chunks            (384 dimensions)            & transferable skills
     │                           │                           │
     └───────────────────────────┼───────────────────────────┘
                                 │
                     Requirement Decision Trace
           (Match Badges, Real Quotes, Real Page Numbers)
                                 │
                  Deterministic Formula Engine
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Candidate Rankings                ✨ Hidden Gems
       (Deterministic Sort)              (High Sem / Low KW)
                 │                               │
                 └───────────────┬───────────────┘
                                 │
              Top 3 Explanations & Why A > B Comparison
```

---

## 2. File Directory

```
nexora_hackathon/
├── backend/
│   ├── main.py                     # FastAPI application endpoints (/health, /analyze, /compare, /demo-data)
│   ├── requirements.txt            # Python dependencies (FastAPI, PyMuPDF, Sentence-Transformers, BM25, etc.)
│   ├── test_pipeline.py            # Automated 10-point pipeline & weight reactivity test suite
│   ├── core/
│   │   ├── __init__.py
│   │   ├── pdf_parser.py           # PyMuPDF parser chunking text with page & section metadata
│   │   ├── jd_analyzer.py          # Requirements extraction (must-have/nice-to-have) & JD quality audit
│   │   ├── keyword_matcher.py      # BM25Okapi lexical matching over resume chunks
│   │   ├── semantic_matcher.py     # sentence-transformers/all-MiniLM-L6-v2 embeddings & cosine sim
│   │   ├── skill_graph.py          # Lightweight bidirectional skill dictionary
│   │   ├── evidence.py             # Match badge classification (EXACT, STRONG RELATED, etc.) & quote selection
│   │   ├── ranking.py              # Deterministic scoring, Hidden Gem detection, Top 3 explanations, Why A > B
│   │   └── pipeline.py             # End-to-end execution coordinator
│   └── graph/
│       ├── __init__.py
│       └── workflow.py             # LangGraph StateGraph orchestration pipeline
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                 # Main recruiter dashboard state & layout
│   │   ├── index.css               # Modern light Tailwind styles & custom scrollbars
│   │   ├── types.ts                # Strict TypeScript interface contracts
│   │   └── components/
│   │       ├── Header.tsx          # Branding, status badges, JD Audit trigger
│   │       ├── UploadPanel.tsx     # Dropzones, demo loader, live signal weight sliders, progress animation
│   │       ├── SummaryCards.tsx    # 4 top metrics (Top Match, Coverage, Hidden Gems, Candidates)
│   │       ├── RankingTable.tsx    # Deterministic candidate ranking table with progress indicators
│   │       ├── Top3Section.tsx     # Top 3 candidate summary cards with rationale
│   │       ├── CandidateDetails.tsx# Slide-over evidence inspector with requirement quotes & page numbers
│   │       ├── EvidenceCard.tsx    # Individual evidence card with real page numbers and match badges
│   │       ├── HiddenGem.tsx       # Highlights overlooked high-semantic candidates
│   │       ├── CompareView.tsx     # Side-by-side Why A > B comparative diff modal
│   │       └── JDAudit.tsx         # Heuristic JD narrowness & quality audit modal
├── data/
│   ├── sample_jd.pdf               # Senior Backend & AI Engineer Job Description
│   ├── resumes/                    # 8 synthetic candidate resumes with distinct profiles
│   └── generate_samples.py         # ReportLab test data generator
├── .env.example                    # Clean environment template
├── .env                            # Local environment configuration (ignored by git)
├── .gitignore                      # Git ignore rules (.env, venvs, cache, node_modules)
├── README.md                       # Comprehensive setup and technical guide
└── SUMMARY.md                      # This document
```

---

## 3. Algorithms & Scoring Formulas

### Hybrid Match Score per Requirement:
$$\text{hybrid\_score} = w_{\text{kw}} \cdot \text{keyword\_score} + w_{\text{sem}} \cdot \text{semantic\_score} + w_{\text{gr}} \cdot \text{graph\_score}$$
Default weights: $w_{\text{kw}} = 0.30$, $w_{\text{sem}} = 0.50$, $w_{\text{gr}} = 0.20$.

### Deterministic Final Candidate Score:
$$\text{final\_score} = 0.50 \cdot \text{must\_have\_cov} + 0.05 \cdot \text{nice\_have\_cov} + 0.45 \cdot (w'_{\text{sem}} \cdot \bar{S}_{\text{sem}} + w'_{\text{kw}} \cdot \bar{S}_{\text{kw}} + w'_{\text{gr}} \cdot \bar{S}_{\text{gr}})$$
Normalized strictly to $[0.0, 100.0]$.

### Match Badge Classification Rules:
- `EXACT MATCH`: High keyword match ($\ge 0.70$) AND high semantic match ($\ge 0.65$), or direct requirement keyword in chunk with semantic score $\ge 0.70$.
- `STRONG RELATED MATCH`: Domain skill graph match ($\ge 0.80$) or deep semantic equivalent ($\ge 0.72$).
- `TRANSFERABLE MATCH`: Transferable domain match or moderate semantic overlap ($\ge 0.60$).
- `PARTIAL MATCH`: Semantic overlap $\ge 0.42$ or keyword presence $\ge 0.40$.
- `NO EVIDENCE`: Below threshold. System explicitly renders: *"No supporting evidence was found in the resume."* (Never claims candidate does not know X).

---

## 4. Models & Orchestration

- **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2`  
  Loaded once as a singleton; produces 384-dimensional dense vectors with mean pooling and L2 normalization.
- **Lexical Index:** `rank_bm25.BM25Okapi` built over extracted paragraphs/bullet chunks per resume.
- **Orchestration:** LangGraph linear `StateGraph`  
  `START -> parse_documents -> extract_requirements -> hybrid_match -> rank_candidates -> generate_explanations -> END`
- **LLM Explanation:** Groq API (`llama-3.1-8b-instant`) with automatic deterministic fallback templates.

---

## 5. Actual Test Results

Executed via automated test suite (`.\nexore\Scripts\python.exe backend/test_pipeline.py`):

```
========================================
STARTING NEXORA PIPELINE VERIFICATION
========================================
[OK] PDF Parser: Extracted 10 chunks from JD.
[OK] JD Analyzer: Found 6 must-have and 3 nice-to-have requirements.
[OK] JD Audit: Healthy=True, Warnings=0
[OK] Loaded 8 synthetic resumes for testing.
[OK] Pipeline Run Successful. Total candidates ranked: 8
   Rank #1: Aarav Sharma - Score: 76.4 (Must-Have: 6/6, Sem: 56.3%, KW: 51.8%)
   Rank #2: Ananya Sen - Score: 75.1 (Must-Have: 6/6, Sem: 51.2%, KW: 44.0%)
   Rank #3: Priya Nair - Score: 65.5 (Must-Have: 5/6, Sem: 48.6%, KW: 45.4%)
   Rank #4: Rohan Gupta - Score: 64.8 (Must-Have: 5/6, Sem: 44.5%, KW: 46.9%)
   Rank #5: Vikram Mehta - Score: 64.4 (Must-Have: 5/6, Sem: 43.6%, KW: 45.4%)
   Rank #6: Marcus Vance - Score: 64.2 (Must-Have: 5/6, Sem: 43.4%, KW: 46.1%)
   Rank #7: Sneha Patil - Score: 35.1 (Must-Have: 2/6, Sem: 39.8%, KW: 38.8%)
   Rank #8: David Miller - Score: 23.6 (Must-Have: 1/6, Sem: 26.7%, KW: 45.0%)
[OK] Rankings strictly follow calculated descending scores.
[OK] Verified Evidence Sample:
   Requirement: '4+ years of professional backend development with Python.'
   Badge: STRONG RELATED MATCH
   Page: 1
   Quote: "Built high-throughput Python applications using FastAPI and SQL databases, handling 50k requests per second." (Related skill: fastapi)
[OK] Hidden Gems Identified: 5
   * Hidden Gem: Priya Nair (KW: 45.4%, Sem: 48.6%)
      Reason: Low keyword overlap (45.4%), but strong semantic evidence (48.6%) and high requirement coverage (83.3%) suggest this candidate could be overlooked by a traditional keyword-only ATS.
[OK] Top 3 Explanations generated successfully.
[OK] Candidate Comparison (Why Aarav Sharma > Ananya Sen):
   - Both candidates cover 6/6 must-have requirements.
   - Aarav Sharma exhibits +5.1% stronger semantic relevance across role requirements.
   - Aarav Sharma matches +7.8% more verified technical keywords.
   - Stronger evidence in 'Exposure to Redis caching, message queues, and CI/CD pipelines.': Aarav Sharma has PARTIAL MATCH (0.322) vs Ananya Sen's NO EVIDENCE (0.0).
   - Stronger evidence in 'Experience with Kubernetes orchestration and cloud deployment on AWS.': Aarav Sharma has EXACT MATCH (0.676) vs Ananya Sen's STRONG RELATED MATCH (0.521).

----------------------------------------
RUNNING CRITICAL WEIGHT REACTIVITY TEST
----------------------------------------
Vikram Mehta (Keyword Stuffer):
   With 70% Keyword Weight  -> Score: 64.4
   With 80% Semantic Weight -> Score: 63.6
Priya Nair (Semantic / Hidden Gem):
   With 70% Keyword Weight  -> Score: 64.7
   With 80% Semantic Weight -> Score: 65.4
[OK] WEIGHT REACTIVITY VERIFIED: Both keyword and semantic signals genuinely alter candidate scores.
========================================
ALL VERIFICATION TESTS PASSED (10/10)!
========================================
```

---

## 6. Endpoints Status

- `GET /health` -> `{"status": "ok", "service": "nexora", "groq_configured": false}` (HTTP 200)
- `GET /demo-data` -> Returns 8 candidates with calculated decision traces and summary metrics (HTTP 200)
- `POST /compare` -> Returns calculated differential for Candidate A vs Candidate B (HTTP 200)
- `POST /analyze` -> Multi-file multipart upload handling JD PDF + resumes + custom weights (HTTP 200)
- Frontend Vite development server -> `http://localhost:5173/` (HTTP 200)

---

## 8. Real Git Commit

- **Commit Message:** `emergency-mvp-2hr`
- **Real Commit SHA:** `4cfe34d60317c1ce271699fc655365910f97a8e6`
- **Branch:** `main` (root commit)
- **Status:** Clean working tree, `.env` strictly ignored, zero secret leaks.
