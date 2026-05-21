from ai_core.parsers.gemini_parser import parse_gemini_response
from ai_core.prompts.prompt_builder import build_dish_text_prompt
from ai_core.providers.gemini_provider import GeminiProvider


class DishAnalyzer:
    def __init__(self, provider: GeminiProvider):
        self.provider = provider

    def analyze(self, dish_name: str) -> dict:
        prompt = build_dish_text_prompt(dish_name)
        raw = self.provider.generate_text(prompt)
        return parse_gemini_response(raw)
