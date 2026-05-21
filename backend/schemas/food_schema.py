from typing import Literal
from pydantic import BaseModel


class NutritionFacts(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sugar_g: float
    sodium_mg: float


class FoodAnalysis(BaseModel):
    dish_name: str
    ingredients: list[str]
    nutrition: NutritionFacts
    allergens: list[Literal["dairy", "nuts", "gluten", "soy", "eggs"]]
    confidence: Literal["high", "medium", "low"]
