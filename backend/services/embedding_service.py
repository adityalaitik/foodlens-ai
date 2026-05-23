import asyncio

from google import genai

from config.settings import settings

_client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _sync_embed(text: str) -> list[float]:
    result = _client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=text,
    )
    return list(result.embeddings[0].values)


async def embed_text(text: str) -> list[float]:
    try:
        return await asyncio.to_thread(_sync_embed, text)
    except Exception:
        return []
