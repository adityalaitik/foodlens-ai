from fastapi import APIRouter, HTTPException

from controllers.analyze_controller import handle_analyze
from schemas.analyze_schema import AnalyzeImageRequest
from schemas.food_schema import FoodAnalysis

router = APIRouter()


@router.post("/analyze", response_model=FoodAnalysis)
def analyze_food(request: AnalyzeImageRequest):
    try:
        return handle_analyze(request)
    except Exception as e:
        msg = str(e)
        if 'RESOURCE_EXHAUSTED' in msg or '429' in msg:
            raise HTTPException(status_code=429, detail=msg)
        raise HTTPException(status_code=500, detail=msg)
