"""
Lightweight Skill Relationship Graph
In-memory dictionary defining technology hierarchies, synonyms, and transferable domains.
No graph database needed. Fast, deterministic, and verifiable.
"""

from typing import Dict, List, Tuple, Set, Any

# Skill knowledge base mapping a skill/domain to related technologies, parent domains, and transferable alternatives
SKILL_RELATIONSHIPS: Dict[str, Dict[str, List[str]]] = {
    "python": {
        "strong": ["fastapi", "django", "flask", "pytorch", "pandas", "numpy", "scikit-learn"],
        "transferable": ["backend development", "data engineering", "machine learning", "scripting"]
    },
    "fastapi": {
        "strong": ["python", "rest apis", "backend development", "asyncio", "pydantic", "starlette"],
        "transferable": ["flask", "django", "express.js", "microservices", "web apis"]
    },
    "django": {
        "strong": ["python", "backend development", "orm", "rest apis"],
        "transferable": ["fastapi", "flask", "ruby on rails", "spring boot"]
    },
    "flask": {
        "strong": ["python", "backend development", "rest apis"],
        "transferable": ["fastapi", "django", "express.js"]
    },
    "rest apis": {
        "strong": ["fastapi", "express.js", "flask", "django", "graphql", "http", "api design"],
        "transferable": ["backend development", "microservices", "web services", "rpc"]
    },
    "sql": {
        "strong": ["postgresql", "mysql", "sqlite", "relational database", "rdbms", "queries"],
        "transferable": ["database design", "database management", "data modeling", "nosql", "mongodb"]
    },
    "postgresql": {
        "strong": ["sql", "relational database", "rdbms", "pgvector", "postgres"],
        "transferable": ["mysql", "sqlite", "database", "database management"]
    },
    "mysql": {
        "strong": ["sql", "relational database", "rdbms"],
        "transferable": ["postgresql", "database", "database management"]
    },
    "docker": {
        "strong": ["containerization", "containers", "dockerfile", "docker-compose"],
        "transferable": ["kubernetes", "devops", "cloud deployment", "ci/cd", "podman"]
    },
    "kubernetes": {
        "strong": ["docker", "container orchestration", "k8s", "helm"],
        "transferable": ["devops", "cloud infrastructure", "microservices"]
    },
    "pytorch": {
        "strong": ["machine learning", "deep learning", "neural networks", "torch", "python"],
        "transferable": ["tensorflow", "keras", "ai", "computer vision", "nlp", "llms"]
    },
    "tensorflow": {
        "strong": ["machine learning", "deep learning", "keras", "neural networks", "python"],
        "transferable": ["pytorch", "ai", "data science", "nlp"]
    },
    "machine learning": {
        "strong": ["pytorch", "tensorflow", "scikit-learn", "deep learning", "data science"],
        "transferable": ["ai", "statistics", "predictive modeling", "llms"]
    },
    "react": {
        "strong": ["javascript", "typescript", "frontend development", "redux", "next.js", "jsx"],
        "transferable": ["vue", "angular", "web development", "ui development"]
    },
    "node.js": {
        "strong": ["javascript", "typescript", "express.js", "backend development", "npm"],
        "transferable": ["fastapi", "python", "backend services", "rest apis"]
    },
    "express.js": {
        "strong": ["node.js", "javascript", "rest apis", "backend development"],
        "transferable": ["fastapi", "flask", "microservices", "web backend"]
    },
    "aws": {
        "strong": ["cloud", "cloud computing", "ec2", "s3", "lambda", "ecs"],
        "transferable": ["gcp", "azure", "devops", "cloud infrastructure"]
    },
    "git": {
        "strong": ["github", "gitlab", "version control", "branching"],
        "transferable": ["devops", "software engineering best practices", "ci/cd"]
    },
    "microservices": {
        "strong": ["docker", "rest apis", "backend development", "distributed systems"],
        "transferable": ["cloud architecture", "kubernetes", "api gateway"]
    }
}

def normalize_skill(skill: str) -> str:
    """Normalize skill name for matching."""
    s = skill.lower().strip()
    s = s.replace("-", " ").replace(".", "")
    return s

def find_skill_relationships(requirement: str) -> Dict[str, Any]:
    """
    Given a requirement phrase, find mapped strong relations and transferable skills.
    """
    req_lower = requirement.lower()
    strong_matches = set()
    transferable_matches = set()
    matched_canonical = []

    for key, data in SKILL_RELATIONSHIPS.items():
        if key in req_lower:
            matched_canonical.append(key)
            strong_matches.update(data.get("strong", []))
            transferable_matches.update(data.get("transferable", []))

    return {
        "canonical_skills": matched_canonical,
        "strong_relations": list(strong_matches),
        "transferable_relations": list(transferable_matches)
    }

def calculate_graph_score(requirement: str, resume_text: str) -> Tuple[float, str, str]:
    """
    Evaluates whether the candidate possesses strong related or transferable skills
    even if the exact requirement keyword is absent.

    Returns: (graph_score: float, matched_evidence_skill: str, relation_type: str)
    """
    resume_lower = resume_text.lower()
    relations = find_skill_relationships(requirement)

    # 1. Check strong relations (e.g. requirement: "FastAPI", resume mentions "Express.js" or "REST APIs")
    for strong in relations["strong_relations"]:
        # Word boundary or standalone occurrence check
        if f" {strong.lower()} " in f" {resume_lower} " or strong.lower() in resume_lower:
            return 0.85, strong, "STRONG RELATED MATCH"

    # 2. Check transferable relations (e.g. requirement: "PyTorch", resume mentions "TensorFlow")
    for trans in relations["transferable_relations"]:
        if f" {trans.lower()} " in f" {resume_lower} " or trans.lower() in resume_lower:
            return 0.65, trans, "TRANSFERABLE MATCH"

    return 0.0, "", "NO RELATION"
