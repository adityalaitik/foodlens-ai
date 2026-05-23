import logging

logger = logging.getLogger(__name__)

# In-memory food store: keyed by bpn
mock_food_db: dict[str, dict] = {}

# In-memory vector store: list of {qdrant_id, bpn, dish_name, store_id, allergens, source, embedding}
mock_vector_store: list[dict] = []


def _seed_from_catalog() -> None:
    from datetime import datetime, timezone
    from data.mock_catalog import MOCK_CATALOG

    now = datetime.now(timezone.utc).isoformat()
    for upc, entry in MOCK_CATALOG.items():
        parts = entry["bpn"].split("_", 1)
        store_id = parts[1] if len(parts) == 2 else "store1"
        doc = {
            **entry,
            "upcs": [upc],
            "store_id": store_id,
            "brand": "",
            "description": "",
            "qdrant_id": None,
            "training_samples": [],
            "created_at": now,
            "updated_at": now,
        }
        mock_food_db[doc["bpn"]] = doc

    logger.info("Mock DB initialized with %d catalog entries", len(mock_food_db))


async def init_db() -> None:
    _seed_from_catalog()


async def close_db() -> None:
    pass
