from fastapi import APIRouter, Query
from ..schemas import RecommendationResponse
from ..services.recommend import recommend_artists_for_brand

router = APIRouter(prefix="/recommendations", tags=["recommend"])

@router.get("/{brand}", response_model=RecommendationResponse)
def api_recommendations(
    brand: str,
    topK: int = Query(10, ge=1, le=50),
    artistGender: str | None = Query(
        None,
        description="藝人性別: M=男性 / F=女性"
    ),
    minAge: int | None = Query(None, ge=10, le=90),
    maxAge: int | None = Query(None, ge=10, le=90),
):
    recs = recommend_artists_for_brand(
        brand_name=brand,
        top_k=topK,
        artist_gender_filter=artistGender,
        min_age=minAge,
        max_age=maxAge,
    )
    return {
        "brand": brand,
        "results": recs,
    }