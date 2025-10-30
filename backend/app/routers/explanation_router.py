from fastapi import APIRouter
from ..services.llm import build_recommendation_pitch

router = APIRouter(prefix="/explanation", tags=["explanation"])

@router.get("/{brand}/{artist}")
def api_explanation(brand: str, artist: str):
    result = build_recommendation_pitch(brand, artist)
    return result