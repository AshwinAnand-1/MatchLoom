# Nexora — Evidence-First AI Hiring Intelligence

> **Smart Shortlisting Engine — Rank Resumes Against a Job Description**
> *"Other ATS systems give you a score. Nexora shows you the evidence behind the score."*

---

## 💡 What It Does

Nexora is a high-precision, transparent candidate ranking and decision intelligence platform built for modern technical recruiters. Given a Job Description (JD) PDF and a pool of candidate resume PDFs, Nexora evaluates candidates against each individual role requirement using a dual-signal hybrid engine:
1. **BM25 Lexical Keyword Matching** (`rank_bm25`) over segmented resume chunks.
2. **Dense Semantic Embeddings** (`sentence-transformers/all-MiniLM-L6-v2`) with cosine similarity.
3. **Skill Relationship Graph** for identifying related technologies and transferable engineering competencies.

Every candidate rank is backed by verifiable resume quotes, exact page numbers, and a complete decision trace.

---

## ⚡ Why It Is Different

1. **Zero LLM Score Hallucination:** 
   **The LLM does NOT calculate the final candidate score.** Most modern "AI ATS" tools naively dump entire resumes into an LLM prompt and ask it to output a rating. This is non-deterministic, biased, costly, and unverifiable. In Nexora, our deterministic Python ranking engine calculates the score using a multi-factor mathematical formula.
2. **Dual-Signal Hybrid Matching:**
   A keyword-only ATS rejects candidates who use equivalent terminology (e.g. Node.js/Express vs FastAPI). A pure semantic search often rewards verbose fluff. Nexora combines both signals with configurable weights so neither keyword stuffers nor ungrounded applicants slip through undetected.
3. **✨ Hidden Gem Detection:**
   Programmatically surfaces candidates with modest exact keyword overlap but outstanding semantic capability and requirement coverage who would typically be dropped by traditional legacy keyword ATS filters.
4. **Why Candidate A > Candidate B:**
   Provides side-by-side automated comparative diffs explaining exactly why one candidate ranked above another based on concrete evidence gaps.
5. **JD Quality & Narrowness Audit:**
   Automatically audits the Job Description for excessive must-haves, competing framework demands (e.g., React + Angular + Vue), and subjective buzzwords before shortlisting begins.

---

## 🏗️ Architecture Pipeline

```
Job Description (PDF) + Resumes (PDFs)
                │
                ▼
        [PyMuPDF Parser]
   (Page tracking & chunking)
                │
                ▼
       [JD Analyzer & Audit]
 (Must-Haves & Nice-To-Haves Extraction)
                │
        ┌───────┴────────────────────────┐
        ▼                                ▼
[BM25 Lexical Engine]        [SentenceTransformers]
   (Exact tokens)             (MiniLM-L6-v2 Embeddings)
        │                                │
        └───────┬────────────────────────┘
                ▼
      [Skill Graph Dictionary]
(Direct, Strong Related & Transferable Matches)
                │
                ▼
     [Decision Trace & Evidence]
 (Match Type Badges, Quotes, Real Page Numbers)
                │
                ▼
    [Deterministic Ranking Formula]
 (50% Must-Have + 5% Nice-to-Have + 45% Configurable Signal Allocation)
                │
                ▼
  [Groq LLM / Deterministic Rationale]
 (Top 3 Explanations & Recruiter Insights)
```

---

## 🛠️ Tech Stack

- **Backend:** Python 3.12, FastAPI, Uvicorn
- **Orchestration:** LangGraph state machine
- **PDF Extraction:** PyMuPDF (`pymupdf`) with page and section tracking
- **Keyword Engine:** BM25Okapi (`rank-bm25`)
- **Semantic Engine:** `sentence-transformers/all-MiniLM-L6-v2` (`transformers` + PyTorch)
- **Domain Graph:** In-memory lightweight bidirectional relationship dictionary
- **LLM Rationale:** Groq API (`llama-3.1-8b-instant`) with deterministic template fallbacks
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons

---

## 🚀 Setup & Installation

### 1. Clone & Environment Configuration

```bash
git clone <repo-url>
cd nexora_hackathon
```

Create `.env` from `.env.example`:
```bash
cp .env.example .env
```
Add your Groq API key to `.env` (optional; system operates seamlessly with deterministic templates if omitted):
```
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 2. Python Virtual Environment (`nexore`)

Create the virtual environment named `nexore`:

**Windows:**
```powershell
python -m venv nexore
.\nexore\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

**Linux / macOS:**
```bash
python3 -m venv nexore
source nexore/bin/activate
pip install -r backend/requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

---

## 🏃 Running the Application

### 1. Run the Backend API

From the project root:
```bash
# Windows
.\nexore\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000

# Linux / macOS
./nexore/bin/uvicorn backend.main:app --reload --port 8000
```
Backend runs at: `http://localhost:8000`  
Health check: `http://localhost:8000/health`  
Interactive Docs: `http://localhost:8000/docs`

### 2. Run the Frontend Dashboard

In a separate terminal:
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🧪 Generating Synthetic Test Data & Running Tests

Generate 1 sample JD and 8 diverse synthetic candidate resumes:
```bash
.\nexore\Scripts\python.exe data/generate_samples.py
```

Run the automated 10-point pipeline and weight reactivity test suite:
```bash
.\nexore\Scripts\python.exe backend/test_pipeline.py
```

### Test Suite Validations:
1. PyMuPDF text chunking and page metadata retention.
2. Must-have vs nice-to-have requirement extraction and JD quality audit.
3. Batch parsing and indexing across 8 candidate resumes.
4. Deterministic score calculation and strict descending order sorting.
5. Exact page number and quote citation in decision traces.
6. Programmatic Hidden Gem detection.
7. Top 3 shortlist explanation synthesis.
8. Comparative "Why A > B" differential generator.
9. **Critical Weight Reactivity Test:** Verifies that changing keyword vs semantic signal weights dynamically alters candidate rankings and scores.

---

## ⚖️ Scoring Formula

Candidate scores are calculated deterministically:

$$\text{Final Score} = 0.50 \cdot \text{Coverage}_{\text{must\_have}} + 0.05 \cdot \text{Coverage}_{\text{nice\_to\_have}} + 0.45 \cdot (w_{\text{sem}} \cdot Q_{\text{sem}} + w_{\text{kw}} \cdot Q_{\text{kw}} + w_{\text{gr}} \cdot Q_{\text{gr}})$$

- $\text{Coverage}$: Ratio of verified requirements with evidence ($[0.0, 1.0]$).
- $Q_{\text{sem}}$: Average semantic cosine similarity across requirements.
- $Q_{\text{kw}}$: Average normalized BM25 score across requirements.
- $Q_{\text{gr}}$: Average skill graph relationship score across requirements.
- $w_{\text{sem}}, w_{\text{kw}}, w_{\text{gr}}$: Configurable weights (default: $0.50, 0.30, 0.20$).
- Output is normalized to a 0–100 scale.
