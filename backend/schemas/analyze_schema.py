from pydantic import BaseModel


class AnalyzeImageRequest(BaseModel):
    base64_image: str
    upc: str | None = None
    store_id: str | None = None


class AskDishRequest(BaseModel):
    dish_name: str
    store_id: str | None = None
