from data.mock_catalog import MOCK_CATALOG
from schemas.analyze_schema import AnalyzeImageRequest
from schemas.food_schema import FoodAnalysis
from services.ai_service import ai_service


def handle_analyze(request: AnalyzeImageRequest) -> FoodAnalysis:
    # 1. UPC provided → check mock catalog first
    if request.upc:
        entry = MOCK_CATALOG.get(request.upc)
        if entry:
            return FoodAnalysis(**entry)

    # 2. Not in catalog (or no UPC) → fall back to Gemini
    return ai_service.analyze_image(request.base64_image)
