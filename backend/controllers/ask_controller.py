import asyncio
import re

from config.settings import settings
from models.food_document import food_document_to_analysis
from schemas.analyze_schema import AskDishRequest
from schemas.food_schema import FoodAnalysis
from services.ai_service import ai_service
from services.food_db_service import find_by_bpn, upsert_food_details
from services.vector_service import search_similar_products, upsert_product_vector

_SIMILARITY_THRESHOLD = 0.85


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


async def handle_ask(request: AskDishRequest) -> FoodAnalysis:
    store_id = request.store_id or settings.STORE_ID

    # 1. Semantic search in vector store
    matches = await search_similar_products(request.dish_name, limit=5)
    for match in matches:
        if match["score"] >= _SIMILARITY_THRESHOLD:
            doc = await find_by_bpn(match["bpn"])
            if doc:
                return food_document_to_analysis(doc)

    # 2. No vector match — Gemini text analysis
    result = await asyncio.to_thread(ai_service.analyze_dish, request.dish_name)

    # 3. Save to mock DB + vector store for future cache hits
    bpn = f"ask_{_slug(result.dish_name)}_{store_id}"
    qdrant_id = await upsert_product_vector(bpn, result.dish_name, store_id, list(result.allergens), "gemini")
    await upsert_food_details(
        bpn=bpn,
        upcs=[],
        store_id=store_id,
        analysis=result,
        source="gemini",
        qdrant_id=qdrant_id or None,
    )
    return result
