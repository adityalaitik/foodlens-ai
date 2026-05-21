import base64

from ai_core.parsers.gemini_parser import parse_gemini_response
from ai_core.prompts.prompt_builder import build_food_image_prompt
from ai_core.providers.gemini_provider import GeminiProvider


class FoodAnalyzer:
    def __init__(self, provider: GeminiProvider):
        self.provider = provider

    def analyze(self, base64_image: str) -> dict:
        image_bytes = base64.b64decode(base64_image)
        prompt = build_food_image_prompt()
        raw = self.provider.generate_with_image(prompt, image_bytes)
        return parse_gemini_response(raw)
