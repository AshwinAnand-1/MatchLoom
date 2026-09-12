import re
import os
from typing import Dict, List, Any, Optional
import pymupdf

COMMON_SECTIONS = [
    "EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "PROJECTS", 
    "TECHNICAL SKILLS", "SKILLS", "EDUCATION", "SUMMARY", 
    "PROFILE", "CERTIFICATIONS", "PUBLICATIONS", "ACHIEVEMENTS"
]

def clean_text(text: str) -> str:
    """Normalize whitespace and weird symbols without altering meaning."""
    text = re.sub(r'[\r\f\v]', ' ', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()

def detect_section_header(line: str) -> Optional[str]:
    """Detect common resume section headers even with unusual formatting or bullets."""
    clean_line = re.sub(r'^[•\-\*#\d\.\s]+', '', line).strip()
    upper_line = clean_line.upper()
    for sec in COMMON_SECTIONS:
        if upper_line == sec or upper_line.startswith(sec + ":") or upper_line.startswith(sec + " -"):
            return sec
    return None

def extract_candidate_name(first_page_text: str, fallback_filename: str) -> str:
    """Infer candidate name from the top lines of the resume or fallback to clean filename."""
    lines = [l.strip() for l in first_page_text.split('\n') if l.strip()]
    for line in lines[:5]:
        # Filter out common headers, emails, phones, URLs
        clean_l = re.sub(r'^[•\-\*#\d\.\s]+', '', line).strip()
        if '@' in clean_l or 'http' in clean_l.lower() or 'resume' in clean_l.lower() or 'curriculum' in clean_l.lower():
            continue
        if len(clean_l.split()) in [2, 3, 4] and len(clean_l) < 35 and not any(sec in clean_l.upper() for sec in COMMON_SECTIONS):
            # Check if alphabetic
            if all(part.isalpha() or part.replace('-', '').isalpha() for part in clean_l.split()):
                return clean_l.title()
    
    # Fallback to file basename
    name_from_file = os.path.splitext(os.path.basename(fallback_filename))[0]
    name_from_file = re.sub(r'[_ -]+', ' ', name_from_file)
    name_from_file = re.sub(r'\b(resume|cv|candidate|profile)\b', '', name_from_file, flags=re.IGNORECASE).strip()
    return name_from_file.title() if name_from_file else "Candidate"

def parse_pdf(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Parses a PDF file using PyMuPDF.
    Extracts text per page, chunks paragraphs with page and section metadata.
    """
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        return {
            "filename": filename,
            "candidate_name": extract_candidate_name("", filename),
            "pages": [],
            "chunks": [],
            "full_text": "",
            "has_sufficient_text": False,
            "error": f"Failed to open PDF: {str(e)}"
        }

    pages_data = []
    chunks = []
    chunk_counter = 0
    current_section = "GENERAL"

    for page_idx in range(len(doc)):
        page_num = page_idx + 1  # 1-indexed for recruiters
        page = doc[page_idx]
        page_text = clean_text(page.get_text("text"))
        pages_data.append({"page_number": page_num, "text": page_text})

        # Process lines to create semantic chunks (paragraphs / bullet items)
        lines = page_text.split('\n')
        current_chunk_lines = []

        for line in lines:
            line_str = line.strip()
            if not line_str:
                if current_chunk_lines:
                    chunk_text = " ".join(current_chunk_lines).strip()
                    if len(chunk_text) > 15:
                        chunks.append({
                            "chunk_id": chunk_counter,
                            "text": chunk_text,
                            "page_number": page_num,
                            "section": current_section
                        })
                        chunk_counter += 1
                    current_chunk_lines = []
                continue

            sec_match = detect_section_header(line_str)
            if sec_match:
                if current_chunk_lines:
                    chunk_text = " ".join(current_chunk_lines).strip()
                    if len(chunk_text) > 15:
                        chunks.append({
                            "chunk_id": chunk_counter,
                            "text": chunk_text,
                            "page_number": page_num,
                            "section": current_section
                        })
                        chunk_counter += 1
                    current_chunk_lines = []
                current_section = sec_match
                continue

            # Check for bullet points indicating a new item
            is_bullet = bool(re.match(r'^[•\-\*▪▫►–]\s+', line_str)) or (len(line_str) > 2 and line_str[0].isdigit() and line_str[1] in '.)')
            if is_bullet and current_chunk_lines:
                chunk_text = " ".join(current_chunk_lines).strip()
                if len(chunk_text) > 15:
                    chunks.append({
                        "chunk_id": chunk_counter,
                        "text": chunk_text,
                        "page_number": page_num,
                        "section": current_section
                    })
                    chunk_counter += 1
                current_chunk_lines = [line_str]
            else:
                current_chunk_lines.append(line_str)

        # Flush trailing lines of page
        if current_chunk_lines:
            chunk_text = " ".join(current_chunk_lines).strip()
            if len(chunk_text) > 15:
                chunks.append({
                    "chunk_id": chunk_counter,
                    "text": chunk_text,
                    "page_number": page_num,
                    "section": current_section
                })
                chunk_counter += 1

    full_text = "\n\n".join([p["text"] for p in pages_data]).strip()
    first_page_text = pages_data[0]["text"] if pages_data else ""
    candidate_name = extract_candidate_name(first_page_text, filename)

    has_sufficient_text = len(full_text.split()) >= 25

    return {
        "filename": filename,
        "candidate_name": candidate_name,
        "pages": pages_data,
        "chunks": chunks,
        "full_text": full_text,
        "has_sufficient_text": has_sufficient_text,
        "error": None if has_sufficient_text else "Could not extract sufficient text from this resume."
    }
