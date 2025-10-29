from fastapi import APIRouter
from ..services.llm import build_recommendation_pitch

router = APIRouter(prefix="/explanation", tags=["explanation"])

@router.get("/{brand}/{artist}")
def api_explanation(brand: str, artist: str):
    """
    回傳「為什麼這個品牌應該找這個藝人」的提案說詞。
    """
    result = build_recommendation_pitch(brand, artist)
    return result