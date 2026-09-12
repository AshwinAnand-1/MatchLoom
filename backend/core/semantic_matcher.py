"""
Semantic Matching Engine using sentence-transformers/all-MiniLM-L6-v2.
Loads the model once, caches chunk embeddings, and calculates cosine similarity.
Uses direct HuggingFace Transformers AutoModel with mean pooling for high performance and reliability.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModel

_MODEL_INSTANCE = None

class MiniLMSentenceTransformer:
    """Wrapper implementing sentence-transformers embedding encoding with mean pooling."""
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()

    def encode(self, texts: List[str], normalize_embeddings: bool = True, show_progress_bar: bool = False) -> np.ndarray:
        if not texts:
            return np.zeros((0, 384), dtype=np.float32)

        # Batch encode with padding and truncation
        encoded_input = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors="pt"
        )

        with torch.no_grad():
            model_output = self.model(**encoded_input)

        # Mean Pooling - Take attention mask into account for correct averaging
        token_embeddings = model_output[0]  # First element contains token embeddings
        input_mask_expanded = encoded_input["attention_mask"].unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, dim=1)
        sum_mask = torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)
        embeddings = sum_embeddings / sum_mask

        if normalize_embeddings:
            embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)

        return embeddings.cpu().numpy()

def get_embedding_model():
    """Singleton loader for sentence-transformers model."""
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        _MODEL_INSTANCE = MiniLMSentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _MODEL_INSTANCE

class SemanticMatcher:
    def __init__(self, chunks: List[Dict[str, Any]]):
        self.chunks = chunks
        self.model = get_embedding_model()
        self.chunk_embeddings = None
        self._precompute_embeddings()

    def _precompute_embeddings(self):
        """Precompute and cache embeddings for all resume chunks."""
        if not self.chunks:
            self.chunk_embeddings = np.zeros((0, 384), dtype=np.float32)
            return

        texts = [c["text"] for c in self.chunks]
        self.chunk_embeddings = self.model.encode(texts, normalize_embeddings=True)

    def match_requirement(self, requirement: str) -> Tuple[float, Dict[str, Any]]:
        """
        Calculates cosine similarity between the requirement embedding and chunk embeddings.
        Returns:
            semantic_score: float in [0.0, 1.0]
            best_chunk: Dict with chunk metadata and text
        """
        if not self.chunks or len(self.chunk_embeddings) == 0:
            return 0.0, {"text": "No chunks available", "page_number": 1, "section": "GENERAL"}

        req_embedding = self.model.encode([requirement], normalize_embeddings=True)
        # Cosine similarity between normalized vectors is the dot product
        sims = np.dot(self.chunk_embeddings, req_embedding.T).flatten()

        max_idx = int(np.argmax(sims))
        raw_sim = float(sims[max_idx])
        best_chunk = self.chunks[max_idx]

        norm_score = max(0.0, min(1.0, raw_sim))
        return round(float(norm_score), 3), best_chunk
