from fastapi import APIRouter, HTTPException

from controllers.ask_controller import handle_ask
from schemas.analyze_schema import AskDishRequest
from schemas.food_schema import FoodAnalysis

router = APIRouter()


@router.post("/ask", response_model=FoodAnalysis)
def ask_dish(request: AskDishRequest):
    try:
        return handle_ask(request)
    except Exception as e:
        msg = str(e)
        if 'RESOURCE_EXHAUSTED' in msg or '429' in msg:
            raise HTTPException(status_code=429, detail=msg)
        raise HTTPException(status_code=500, detail=msg)
