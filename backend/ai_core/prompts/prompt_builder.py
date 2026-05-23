from ai_core.prompts.food_prompt import FOOD_ANALYSIS_PROMPT
from ai_core.prompts.dish_prompt import DISH_ANALYSIS_PROMPT_TEMPLATE


def build_food_image_prompt() -> str:
    return FOOD_ANALYSIS_PROMPT


def build_dish_text_prompt(dish_name: str) -> str:
    return DISH_ANALYSIS_PROMPT_TEMPLATE.format(dish_name=dish_name)


def build_food_image_with_context_prompt(name: str, brand: str, description: str) -> str:
    context = (
        f"Product context from catalog:\n"
        f"Name: {name}\n"
        f"Brand: {brand}\n"
        f"Description: {description}\n"
        f"Use this to provide accurate nutrition analysis.\n\n"
    )
    return context + FOOD_ANALYSIS_PROMPT
