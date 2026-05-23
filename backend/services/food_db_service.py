from datetime import datetime, timezone

from config.database import mock_food_db
from models.food_document import food_document_to_analysis
from schemas.food_schema import FoodAnalysis


async def find_by_upc(upc: str, store_id: str) -> dict | None:
    for doc in mock_food_db.values():
        if upc in doc.get("upcs", []) and doc.get("store_id") == store_id:
            return doc
    return None


async def find_by_bpn(bpn: str) -> dict | None:
    return mock_food_db.get(bpn)


async def upsert_food_details(
    bpn: str,
    upcs: list[str],
    store_id: str,
    analysis: FoodAnalysis,
    brand: str = "",
    description: str = "",
    source: str = "gemini",
    qdrant_id: str | None = None,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    existing = mock_food_db.get(bpn)
    doc = {
        "bpn": bpn,
        "upcs": upcs,
        "store_id": store_id,
        "dish_name": analysis.dish_name,
        "brand": brand,
        "description": description,
        "ingredients": analysis.ingredients,
        "nutrition": analysis.nutrition.model_dump(),
        "allergens": list(analysis.allergens),
        "confidence": analysis.confidence,
        "source": source,
        "qdrant_id": qdrant_id,
        "training_samples": existing["training_samples"] if existing else [],
        "created_at": existing["created_at"] if existing else now,
        "updated_at": now,
    }
    mock_food_db[bpn] = doc
    return doc


async def append_training_sample(bpn: str, image_base64: str, gemini_response: dict) -> None:
    doc = mock_food_db.get(bpn)
    if not doc:
        return
    sample = {
        "image_base64": image_base64[:200] + "...",
        "gemini_response": gemini_response,
        "captured_at": datetime.now(timezone.utc).isoformat(),
    }
    doc["training_samples"].append(sample)
