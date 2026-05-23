from schemas.food_schema import FoodAnalysis, NutritionFacts


def food_document_to_analysis(doc: dict) -> FoodAnalysis:
    nutrition = doc["nutrition"]
    if isinstance(nutrition, dict):
        nutrition = NutritionFacts(**nutrition)
    return FoodAnalysis(
        dish_name=doc["dish_name"],
        ingredients=doc["ingredients"],
        nutrition=nutrition,
        allergens=doc["allergens"],
        confidence=doc["confidence"],
    )
