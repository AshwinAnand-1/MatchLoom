"""
Keyword Matching Engine using BM25 (rank_bm25).
Indexes resume chunks per candidate and evaluates lexical match against requirements.
"""

import re
from typing import List, Dict, Any, Tuple
from rank_bm25 import BM25Okapi

def tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase alphanumeric words."""
    tokens = re.findall(r'\b[a-zA-Z0-9_\+#\.]+\b', text.lower())
    # Keep words with length >= 2 or meaningful single chars like 'c'
    return [t for t in tokens if len(t) > 1 or t in ['c', 'r']]

class BM25KeywordMatcher:
    def __init__(self, chunks: List[Dict[str, Any]]):
        """
        chunks: List of dictionaries with keys: {"chunk_id", "text", "page_number", "section"}
        """
        self.chunks = chunks
        self.corpus = [tokenize(c["text"]) for c in chunks] if chunks else []
        self.bm25 = BM25Okapi(self.corpus) if self.corpus and any(len(c) > 0 for c in self.corpus) else None

    def match_requirement(self, requirement: str) -> Tuple[float, Dict[str, Any]]:
        """
        Queries BM25 for the requirement.
        Returns:
            normalized_score: float in [0.0, 1.0]
            best_chunk: Dict with chunk metadata and text
        """
        if not self.bm25 or not self.chunks:
            return 0.0, {"text": "No chunks indexed", "page_number": 1, "section": "GENERAL"}

        query_tokens = tokenize(requirement)
        if not query_tokens:
            return 0.0, {"text": "Empty query", "page_number": 1, "section": "GENERAL"}

        scores = self.bm25.get_scores(query_tokens)
        if len(scores) == 0:
            return 0.0, self.chunks[0]

        max_idx = int(scores.argmax())
        raw_score = float(scores[max_idx])
        best_chunk = self.chunks[max_idx]

        # Check for direct phrase match in the best chunk for a bonus
        req_clean = requirement.lower().strip()
        chunk_clean = best_chunk["text"].lower()

        # BM25 scores can vary based on document length and term frequency.
        # Normalize into [0.0, 1.0] using an empirical sigmoid-like saturation
        # Standard raw scores for short queries typically range from 1 to 15.
        if raw_score <= 0.0:
            normalized_score = 0.0
        else:
            normalized_score = min(1.0, raw_score / (raw_score + 4.0))

        # Direct keyword presence boost
        if req_clean in chunk_clean:
            normalized_score = max(normalized_score, 0.85)
        elif any(qt in chunk_clean for qt in query_tokens if len(qt) > 2):
            # Partial token match guarantee
            normalized_score = max(normalized_score, 0.45)

        return round(float(normalized_score), 3), best_chunk
