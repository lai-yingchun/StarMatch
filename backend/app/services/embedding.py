from typing import Any

import numpy as np
import voyageai

from ..config import VOYAGE_API_KEY, VOYAGE_MODEL

class VoyageEmbeddingError(Exception):
    """Raised when Voyage AI embedding service fails."""

_voyage_client: voyageai.Client | None = None

def _get_client() -> voyageai.Client:
    global _voyage_client
    if not VOYAGE_API_KEY:
        raise VoyageEmbeddingError("Voyage API key is not configured.")
    if _voyage_client is None:
        _voyage_client = voyageai.Client(api_key=VOYAGE_API_KEY)
    return _voyage_client

def get_voyage_embedding(text: str) -> np.ndarray:
    if not text or not text.strip():
        raise VoyageEmbeddingError("Input text is empty.")

    client = _get_client()
    model_name = VOYAGE_MODEL or ""
    print(model_name)
    try:
        response = client.embed(
            text,
            model=model_name,
            input_type="document",
        )
    except Exception as exc:
        raise VoyageEmbeddingError(f"Voyage embed request failed: {exc}") from exc

    embeddings: Any = getattr(response, "embeddings", None)
    if not embeddings:
        raise VoyageEmbeddingError("Voyage API returned no embeddings.")

    return np.array(embeddings[0], dtype=np.float32)
