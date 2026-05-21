# FoodLens AI — MVP2: Catalog + Vector DB Integration

## Overview
Replace `data/mock_catalog.py` with real MongoDB (catalog service) + Qdrant (vector search).
This turns FoodLens into a fully LLM-compatible food intelligence layer over the retail catalog.

---

## Technology Stack

| Layer | Tool | Notes |
|---|---|---|
| Structured lookup | MongoDB (existing cluster) | New `food_details` collection |
| Vector / semantic | Qdrant (self-hosted, free) | `docker run -p 6333:6333 qdrant/qdrant` |
| Embeddings | Gemini `text-embedding-004` | 1M tokens/day free |
| Catalog API | Existing HTTP endpoints | UPC-based lookup |

---

## Key Data Facts
- **BPN** = `{upc}_{store_id}` — primary identifier
- One BPN can have **multiple UPCs** (stored as array)
- Existing catalog APIs accept UPC → return product name + description
- New MongoDB collection `food_details` sits in the **same cluster**

---

## Request Flow

```
POST /api/analyze { base64_image, upc?, store_id? }
         │
         ▼
  UPC present?
  YES → MongoDB food_details lookup by BPN or upcs[]
           FOUND → return instantly (no Gemini)
           NOT FOUND → Catalog API (HTTP) → get name + description
                         → Gemini (image + product context RAG prompt)
                         → Save to MongoDB food_details
                         → Generate embedding → upsert to Qdrant
                         → Append training_sample
                         → return result

  NO  → Embed query image → Qdrant semantic search → top-k products
           High confidence match → return from MongoDB
           No match → Gemini image-only → return
```

---

## RAG Prompt Injection (when catalog product found, Gemini needed)
```
"Product context from catalog:
 Name: {product_name}
 Brand: {brand}
 Description: {description}
 Use this to provide accurate nutrition analysis."
```

---

## MongoDB Collection: `food_details`

```json
{
  "bpn": "0041303014110_store42",
  "upcs": ["0041303014110"],
  "store_id": "store42",
  "dish_name": "Horizon Organic Whole Milk",
  "brand": "Horizon",
  "description": "USDA organic whole milk...",
  "ingredients": ["Organic Grade A Whole Milk", "Vitamin D3"],
  "nutrition": {
    "calories": 150, "protein_g": 8, "carbs_g": 12,
    "fat_g": 8, "fiber_g": 0, "sugar_g": 12, "sodium_mg": 125
  },
  "allergens": ["dairy"],
  "confidence": "high",
  "source": "catalog | gemini",
  "qdrant_id": "uuid",
  "training_samples": [
    { "image_base64": "...", "gemini_response": {}, "captured_at": "..." }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

**Indexes:** `bpn` (unique), `upcs` (multikey), `store_id`

---

## Qdrant Collection: `food_products`

```json
{
  "id": "uuid",
  "vector": [0.021, -0.14, "...768 dims"],
  "payload": {
    "bpn": "...",
    "dish_name": "Horizon Organic Whole Milk",
    "store_id": "store42",
    "allergens": ["dairy"],
    "source": "catalog"
  }
}
```

---

## New Backend Files to Create

| File | Purpose |
|---|---|
| `backend/config/database.py` | Motor async MongoDB client + Qdrant client, initialized via FastAPI lifespan |
| `backend/models/food_document.py` | Pydantic models for MongoDB doc + `food_document_to_analysis()` helper |
| `backend/services/catalog_client.py` | httpx async client → existing catalog REST API by UPC |
| `backend/services/food_db_service.py` | `find_by_bpn`, `find_by_upc`, `upsert_food_details`, `append_training_sample` |
| `backend/services/embedding_service.py` | `embed_text(text) → list[float]` using Gemini text-embedding-004 |
| `backend/services/vector_service.py` | `search_similar_products`, `upsert_product_vector` wrapping Qdrant |

---

## Files to Modify

| File | Change |
|---|---|
| `backend/config/settings.py` | Add `MONGODB_URI`, `MONGODB_DB_NAME`, `CATALOG_API_URL`, `CATALOG_API_KEY`, `STORE_ID`, `QDRANT_HOST`, `QDRANT_PORT` |
| `backend/controllers/analyze_controller.py` | Replace `MOCK_CATALOG` dict with real `food_db_service` + `catalog_client` |
| `backend/controllers/ask_controller.py` | Replace name fuzzy search with Qdrant semantic search |
| `backend/ai_core/prompts/prompt_builder.py` | Add `build_food_image_with_context_prompt(product_name, description)` |
| `backend/requirements.txt` | Add `motor>=3.3.0`, `httpx>=0.27.0`, `qdrant-client>=1.9.0` |

---

## New Env Vars (add to `.env`)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
MONGODB_DB_NAME=catalog
CATALOG_API_URL=https://your-catalog-service/api
CATALOG_API_KEY=your_key
STORE_ID=store1
QDRANT_HOST=localhost
QDRANT_PORT=6333
```

---

## Local Setup

```bash
# Start Qdrant
docker run -p 6333:6333 qdrant/qdrant

# Qdrant dashboard
open http://localhost:6333/dashboard
```

---

## Training Data → Own Model (Future)

Every Gemini call on a known product stores:
- Input image (base64) in `training_samples[]`
- Raw Gemini response + parsed result
- BPN label for supervised learning

**Export pipeline (later):**
```
MongoDB food_details.training_samples → labeled { image → nutrition/allergens } dataset
→ Fine-tune vision model (Gemini fine-tuning or open-source ViT)
→ Replace Gemini fallback with self-hosted model
```

---

## Migration from MVP1

Only 2 files change in controllers — everything else is additive:
1. `analyze_controller.py` — swap `MOCK_CATALOG.get(upc)` for `food_db_service.find_by_upc(upc, store_id)`
2. `ask_controller.py` — swap `str in` loop for `vector_service.search_similar_products(query)`
