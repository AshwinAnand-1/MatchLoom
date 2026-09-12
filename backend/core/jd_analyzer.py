"""
Job Description Analyzer & Quality Audit Engine.
Extracts must-have and nice-to-have requirements deterministically or via Groq (with zero crash fallback).
Audits JD for narrowness, excessive requirements, and vague buzzwords.
"""

import os
import re
import json
from typing import Dict, List, Any
from dotenv import load_dotenv

load_dotenv()

# Common tech patterns to capture in rule-based extraction
CORE_TECH_SKILLS = [
    "Python", "FastAPI", "SQL", "PostgreSQL", "REST APIs", "Docker", 
    "Kubernetes", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning",
    "React", "Node.js", "Express.js", "AWS", "GCP", "CI/CD", "Git", "Microservices"
]

VAGUE_TERMS = [
    "rockstar", "ninja", "guru", "wizard", "fast learner", "hard worker", 
    "wear many hats", "work under pressure", "self starter", "unicorn"
]

def rule_based_extract_requirements(jd_text: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Deterministic requirement extractor based on common JD headers, bullet points,
    and recognized industry tech skills.
    """
    lines = jd_text.split('\n')
    must_haves = []
    nice_to_haves = []
    
    current_mode = "must_have"  # default mode
    
    for line in lines:
        l_clean = line.strip()
        l_lower = l_clean.lower()
        
        # Section header checking
        if any(h in l_lower for h in ["nice to have", "preferred qualifications", "bonus", "good to have", "plus"]):
            current_mode = "nice_to_have"
            continue
        elif any(h in l_lower for h in ["requirements", "must have", "qualifications", "minimum qualifications", "what you need", "responsibilities"]):
            current_mode = "must_have"
            continue
            
        # Check for bullet points or numbered lists
        is_bullet = bool(re.match(r'^[•\-\*▪▫►–\d\.\)]\s+', l_clean))
        clean_item = re.sub(r'^[•\-\*▪▫►–\d\.\)]\s+', '', l_clean).strip()
        
        if is_bullet and len(clean_item) > 4 and len(clean_item) < 180:
            item_data = {
                "id": f"req_{len(must_haves) + len(nice_to_haves) + 1}",
                "text": clean_item,
                "category": current_mode,
                "importance": 1.0 if current_mode == "must_have" else 0.5
            }
            if current_mode == "must_have":
                must_haves.append(item_data)
            else:
                nice_to_haves.append(item_data)

    # If parsing didn't find enough structured bullets, extract recognized tech skills
    if len(must_haves) < 3:
        for skill in CORE_TECH_SKILLS:
            if re.search(rf'\b{re.escape(skill)}\b', jd_text, re.IGNORECASE):
                # Avoid duplicate addition
                if not any(skill.lower() in m["text"].lower() for m in must_haves):
                    must_haves.append({
                        "id": f"req_{len(must_haves) + len(nice_to_haves) + 1}",
                        "text": f"Proficiency in {skill}",
                        "category": "must_have",
                        "importance": 1.0
                    })

    # Ensure we always have at least some core requirements
    if not must_haves and not nice_to_haves:
        default_reqs = ["Python", "FastAPI", "SQL", "REST APIs", "Docker"]
        for idx, skill in enumerate(default_reqs):
            must_haves.append({
                "id": f"req_{idx + 1}",
                "text": f"Hands-on experience with {skill}",
                "category": "must_have",
                "importance": 1.0
            })

    return {
        "must_have": must_haves,
        "nice_to_have": nice_to_haves
    }

def audit_jd(jd_text: str, requirements: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """
    Audits the JD for:
    - Excessive must-have requirements
    - Duplicate/overlapping requirements
    - Vague buzzwords
    - Unusually narrow technology combinations (e.g., React + Angular + Vue)
    """
    warnings = []
    suggestions = []
    text_lower = jd_text.lower()
    
    must_count = len(requirements.get("must_have", []))
    if must_count > 7:
        warnings.append(f"Excessive must-have requirements detected ({must_count} items).")
        suggestions.append("Consider shifting secondary skills to 'Nice-to-Have' to avoid filtering out strong candidates with high learning agility.")

    # Check vague buzzwords
    found_vague = [term for term in VAGUE_TERMS if term in text_lower]
    if found_vague:
        warnings.append(f"Subjective or vague buzzwords found: {', '.join([f'\"{v}\"' for v in found_vague])}.")
        suggestions.append("Replace subjective adjectives with measurable outcome-oriented deliverables.")

    # Check narrow tech stack combinations
    competing_frameworks = [
        (["react", "angular", "vue"], "Multiple competing frontend frameworks required (React, Angular, Vue)."),
        (["fastapi", "django", "flask", "spring"], "Multiple redundant backend frameworks listed as mandatory."),
        (["postgresql", "mysql", "mongodb", "cassandra"], "Multiple distinct database engines specified as mandatory.")
    ]
    
    narrow_flags = []
    for group, desc in competing_frameworks:
        present = [f for f in group if f in text_lower]
        if len(present) >= 3:
            warnings.append(f"Potentially narrow tech requirement: {desc}")
            suggestions.append(f"Consider evaluating core architectural proficiency rather than demanding all of {', '.join([p.capitalize() for p in present])}.")
            narrow_flags.append(desc)

    return {
        "is_healthy": len(warnings) == 0,
        "warnings": warnings,
        "suggestions": suggestions,
        "must_have_count": must_count,
        "nice_to_have_count": len(requirements.get("nice_to_have", [])),
        "vague_terms": found_vague,
        "narrow_requirements": narrow_flags
    }

def extract_and_audit_jd(jd_text: str) -> Dict[str, Any]:
    """
    Main entry point for JD requirement extraction and auditing.
    Attempts Groq structured extraction if API key is set, otherwise falls back gracefully.
    """
    requirements = rule_based_extract_requirements(jd_text)
    
    api_key = os.getenv("GROQ_API_KEY")
    if api_key and api_key != "YOUR_KEY_HERE" and len(api_key.strip()) > 10:
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            prompt = f"""
Analyze this Job Description and extract the key technical requirements into JSON format.
Separate them into "must_have" and "nice_to_have". Keep each requirement concise (3-8 words).

Job Description:
{jd_text[:3000]}

Respond ONLY with valid JSON in this structure:
{{
  "must_have": ["requirement 1", "requirement 2"],
  "nice_to_have": ["requirement 3"]
}}
"""
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            if "must_have" in data and isinstance(data["must_have"], list) and len(data["must_have"]) > 0:
                must_list = []
                nice_list = []
                for idx, item in enumerate(data["must_have"]):
                    must_list.append({
                        "id": f"req_{idx + 1}",
                        "text": item,
                        "category": "must_have",
                        "importance": 1.0
                    })
                for idx, item in enumerate(data.get("nice_to_have", [])):
                    nice_list.append({
                        "id": f"req_{len(must_list) + idx + 1}",
                        "text": item,
                        "category": "nice_to_have",
                        "importance": 0.5
                    })
                requirements = {"must_have": must_list, "nice_to_have": nice_list}
        except Exception as e:
            # Fallback seamlessly to rule-based without crashing
            pass

    audit_result = audit_jd(jd_text, requirements)
    
    return {
        "requirements": requirements,
        "audit": audit_result
    }
