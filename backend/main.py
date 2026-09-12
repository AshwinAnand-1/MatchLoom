"""
FastAPI Server for Nexora — Evidence-First AI Hiring Intelligence.
"""

import os
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from backend.core.pipeline import run_nexora_pipeline
from backend.core.ranking import compare_candidates
from backend.graph.workflow import nexora_app

app = FastAPI(
    title="Nexora API",
    description="Evidence-First AI Hiring Intelligence Engine",
    version="1.0.0"
)

# Enable CORS for local React/Vite dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompareRequest(BaseModel):
    candidate_a: dict
    candidate_b: dict

@app.get("/")
def root():
    """Root endpoint with quick navigational links."""
    return {
        "service": "Nexora — Evidence-First AI Hiring Intelligence",
        "message": "Backend API is live! Open the UI Dashboard at http://localhost:5173",
        "frontend_dashboard": "http://localhost:5173",
        "interactive_api_docs": "http://localhost:8000/docs",
        "health": "/health",
        "demo_data": "/demo-data"
    }

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "nexora",
        "groq_configured": bool(os.getenv("GROQ_API_KEY") and os.getenv("GROQ_API_KEY") != "YOUR_KEY_HERE")
    }

@app.post("/analyze")
async def analyze_candidates(
    jd_file: UploadFile = File(...),
    resume_files: List[UploadFile] = File(...),
    keyword_weight: float = Form(0.30),
    semantic_weight: float = Form(0.50),
    graph_weight: float = Form(0.20)
):
    """
    Main analysis endpoint.
    Accepts JD PDF and multiple Resume PDFs.
    Calculates deterministic hybrid scores, BM25, semantic embeddings,
    and decision traces.
    """
    if not jd_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Job description must be a PDF file.")

    if not resume_files:
        raise HTTPException(status_code=400, detail="At least one resume PDF is required.")

    # Read JD bytes
    jd_bytes = await jd_file.read()

    # Read resumes bytes
    processed_resumes = []
    for r in resume_files:
        content = await r.read()
        processed_resumes.append({
            "filename": r.filename,
            "bytes": content
        })

    weights = {
        "keyword": keyword_weight,
        "semantic": semantic_weight,
        "graph": graph_weight
    }

    try:
        # Run via LangGraph state workflow
        initial_state = {
            "jd_bytes": jd_bytes,
            "jd_filename": jd_file.filename,
            "resume_files": processed_resumes,
            "weights": weights,
            "parsed_jd": None,
            "parsed_resumes": None,
            "requirements": None,
            "jd_audit": None,
            "candidates_processed": None,
            "top_3": None,
            "hidden_gems": None,
            "top_summary": None,
            "final_output": None
        }

        result_state = nexora_app.invoke(initial_state)
        return result_state["final_output"]
    except Exception as e:
        # Fallback to direct pipeline if graph encounters an issue
        try:
            return run_nexora_pipeline(
                jd_bytes=jd_bytes,
                jd_filename=jd_file.filename,
                resume_files=processed_resumes,
                weights=weights
            )
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=f"Pipeline execution error: {str(inner_e)}")

@app.post("/compare")
def compare_candidates_endpoint(request: CompareRequest):
    """
    Compares two candidates and provides deterministic 'Why A > B' trace.
    """
    try:
        diff = compare_candidates(request.candidate_a, request.candidate_b)
        return diff
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

@app.get("/demo-data")
def get_demo_data():
    """
    Convenience endpoint: parses data/sample_jd.pdf and data/resumes/ to
    provide instant mock / precomputed results for demo.
    """
    sample_jd_path = os.path.join(os.path.dirname(__file__), "..", "data", "sample_jd.pdf")
    resumes_dir = os.path.join(os.path.dirname(__file__), "..", "data", "resumes")

    if not os.path.exists(sample_jd_path) or not os.path.exists(resumes_dir):
        raise HTTPException(status_code=404, detail="Synthetic demo data not yet generated.")

    with open(sample_jd_path, "rb") as f:
        jd_bytes = f.read()

    resume_files = []
    for fname in os.listdir(resumes_dir):
        if fname.endswith(".pdf"):
            fpath = os.path.join(resumes_dir, fname)
            with open(fpath, "rb") as f:
                resume_files.append({"filename": fname, "bytes": f.read()})

    result = run_nexora_pipeline(
        jd_bytes=jd_bytes,
        jd_filename="sample_jd.pdf",
        resume_files=resume_files
    )
    return result
