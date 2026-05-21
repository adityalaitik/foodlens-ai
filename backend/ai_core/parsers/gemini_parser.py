import json
import re

VALID_ALLERGENS = {"dairy", "nuts", "gluten", "soy", "eggs"}
VALID_CONFIDENCE = {"high", "medium", "low"}


def parse_gemini_response(text: str) -> dict:
    # Strip markdown code blocks if the model wraps output despite instructions
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1)

    text = text.strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Last-resort: find the outermost JSON object in the response
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            data = json.loads(match.group())
        else:
            raise ValueError(f"Could not extract JSON from Gemini response: {text[:300]}")

    # Normalize allergens to only valid values
    if "allergens" in data and isinstance(data["allergens"], list):
        data["allergens"] = [a for a in data["allergens"] if a in VALID_ALLERGENS]
    else:
        data["allergens"] = []

    # Normalize confidence
    if data.get("confidence") not in VALID_CONFIDENCE:
        data["confidence"] = "medium"

    # Ensure nutrition block exists with all required fields
    if "nutrition" not in data or not isinstance(data["nutrition"], dict):
        data["nutrition"] = {}
    nutrition_defaults = {
        "calories": 0, "protein_g": 0, "carbs_g": 0,
        "fat_g": 0, "fiber_g": 0, "sugar_g": 0, "sodium_mg": 0,
    }
    for key, default in nutrition_defaults.items():
        data["nutrition"].setdefault(key, default)

    return data
