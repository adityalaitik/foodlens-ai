from data.mock_catalog import MOCK_CATALOG
from schemas.analyze_schema import AskDishRequest
from schemas.food_schema import FoodAnalysis
from services.ai_service import ai_service


def handle_ask(request: AskDishRequest) -> FoodAnalysis:
    # 1. Fuzzy name match against mock catalog
    query = request.dish_name.lower()
    for entry in MOCK_CATALOG.values():
        if query in entry["dish_name"].lower():
            return FoodAnalysis(**entry)

    # 2. No catalog match → fall back to Gemini text analysis
    return ai_service.analyze_dish(request.dish_name)
