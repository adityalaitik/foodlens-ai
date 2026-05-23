import asyncio
import base64 as b64
import re

from ai_core.parsers.gemini_parser import parse_gemini_response
from ai_core.prompts.prompt_builder import build_food_image_with_context_prompt
from ai_core.providers.gemini_provider import GeminiProvider
from config.settings import settings
from models.food_document import food_document_to_analysis
from schemas.analyze_schema import AnalyzeImageRequest
from schemas.food_schema import FoodAnalysis
from services.ai_service import ai_service
from services.catalog_client import get_product_by_upc
from services.food_db_service import append_training_sample, find_by_upc, upsert_food_details
from services.vector_service import upsert_product_vector

_provider = GeminiProvider()


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


async def _gemini_with_context(base64_image: str, name: str, brand: str, description: str) -> FoodAnalysis:
    prompt = build_food_image_with_context_prompt(name, brand, description)
    image_bytes = b64.b64decode(base64_image)
    raw = await asyncio.to_thread(_provider.generate_with_image, prompt, image_bytes)
    data = parse_gemini_response(raw)
    if name:
        data["dish_name"] = name
    return FoodAnalysis(**data)


async def handle_analyze(request: AnalyzeImageRequest) -> FoodAnalysis:
    store_id = request.store_id or settings.STORE_ID

    if request.upc:
        # 1. Mock DB cache hit — no Gemini call
        doc = await find_by_upc(request.upc, store_id)
        if doc:
            return food_document_to_analysis(doc)

        # 2. Catalog API for product context
        catalog_product = await get_product_by_upc(request.upc, store_id)

        # 3. Gemini analysis
        if catalog_product:
            result = await _gemini_with_context(
                request.base64_image,
                catalog_product.get("name", ""),
                catalog_product.get("brand", ""),
                catalog_product.get("description", ""),
            )
            source = "catalog"
            brand = catalog_product.get("brand", "")
            description = catalog_product.get("description", "")
        else:
            result = await asyncio.to_thread(ai_service.analyze_image, request.base64_image)
            source = "gemini"
            brand = ""
            description = ""

        # 4. Save to mock DB + vector store + training sample
        bpn = f"{request.upc}_{store_id}"
        qdrant_id = await upsert_product_vector(bpn, result.dish_name, store_id, list(result.allergens), source)
        await upsert_food_details(
            bpn=bpn,
            upcs=[request.upc],
            store_id=store_id,
            analysis=result,
            brand=brand,
            description=description,
            source=source,
            qdrant_id=qdrant_id or None,
        )
        await append_training_sample(bpn, request.base64_image, result.model_dump())
        return result

    # No UPC — direct Gemini image analysis
    result = await asyncio.to_thread(ai_service.analyze_image, request.base64_image)

    # Progressive DB population (enables future ask-mode cache hits)
    bpn = f"gemini_{_slug(result.dish_name)}_{store_id}"
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
