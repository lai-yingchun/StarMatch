from fastapi import APIRouter
from ..services.llm import build_recommendation_pitch
from ..schemas import ExplanationDescriptionRequest

router = APIRouter(prefix="/explanation", tags=["explanation"])

@router.get("/{brand}/{artist}")
def api_explanation(brand: str, artist: str):
    result = build_recommendation_pitch(brand, artist)
    return result

@router.post("/description")
def api_explanation_by_description(payload: ExplanationDescriptionRequest):
    brand_name = payload.brandName or "品牌敘述推薦"
    result = build_recommendation_pitch(
        brand=brand_name,
        artist=payload.artist,
        brand_desc_override=payload.brandDescription,
        match_score_override=payload.matchScore,
    )
    result["brand"] = brand_name
    return result
