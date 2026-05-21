from ai_core.analyzers.dish_analyzer import DishAnalyzer
from ai_core.analyzers.food_analyzer import FoodAnalyzer
from ai_core.providers.gemini_provider import GeminiProvider
from schemas.food_schema import FoodAnalysis


class AIService:
    def __init__(self):
        provider = GeminiProvider()
        self.food_analyzer = FoodAnalyzer(provider)
        self.dish_analyzer = DishAnalyzer(provider)

    def analyze_image(self, base64_image: str) -> FoodAnalysis:
        data = self.food_analyzer.analyze(base64_image)
        return FoodAnalysis(**data)

    def analyze_dish(self, dish_name: str) -> FoodAnalysis:
        data = self.dish_analyzer.analyze(dish_name)
        return FoodAnalysis(**data)


ai_service = AIService()
