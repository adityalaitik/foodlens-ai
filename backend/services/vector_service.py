import math
import uuid

from config.database import mock_vector_store
from services.embedding_service import embed_text


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


async def search_similar_products(query: str, limit: int = 5) -> list[dict]:
    """Returns [{bpn, dish_name, score}] sorted by similarity descending."""
    if not mock_vector_store:
        return []
    query_vec = await embed_text(query)
    if not query_vec:
        return []
    scored = [
        {
            "bpn": entry["bpn"],
            "dish_name": entry["dish_name"],
            "score": _cosine_similarity(query_vec, entry["embedding"]),
        }
        for entry in mock_vector_store
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:limit]


async def upsert_product_vector(
    bpn: str,
    dish_name: str,
    store_id: str,
    allergens: list[str],
    source: str,
) -> str:
    """Embeds dish_name, upserts into mock_vector_store, returns qdrant_id."""
    embedding = await embed_text(dish_name)
    if not embedding:
        return ""
    qdrant_id = str(uuid.uuid4())
    entry = {
        "qdrant_id": qdrant_id,
        "bpn": bpn,
        "dish_name": dish_name,
        "store_id": store_id,
        "allergens": allergens,
        "source": source,
        "embedding": embedding,
    }
    idx = next((i for i, e in enumerate(mock_vector_store) if e["bpn"] == bpn), None)
    if idx is not None:
        mock_vector_store[idx] = entry
    else:
        mock_vector_store.append(entry)
    return qdrant_id
