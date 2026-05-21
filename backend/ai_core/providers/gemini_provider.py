from google import genai
from google.genai import types
from config.settings import settings


class GeminiProvider:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.MODEL_NAME
        self.config = types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        )

    def generate_text(self, prompt: str) -> str:
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=self.config,
        )
        return response.text

    def generate_with_image(
        self,
        prompt: str,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
    ) -> str:
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = self.client.models.generate_content(
            model=self.model,
            contents=[image_part, prompt],
            config=self.config,
        )
        return response.text
