from fastapi import APIRouter, Query, HTTPException
from ..schemas import (
    RecommendationResponse,
    DescriptionRecommendRequest,
    DescriptionRecommendationResponse,
)
from ..services.recommend import (
    recommend_artists_for_brand,
    recommend_artists_by_description,
)
from ..services.embedding import VoyageEmbeddingError

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

@router.post("/by-description", response_model=DescriptionRecommendationResponse)
def api_recommendations_by_description(payload: DescriptionRecommendRequest):
    try:
        primary_brand, matches, recs = recommend_artists_by_description(
            description=payload.description,
            top_k=payload.topK,
            artist_gender_filter=payload.artistGender,
            min_age=payload.minAge,
            max_age=payload.maxAge,
            product_cats=payload.productCats,
        )
    except VoyageEmbeddingError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return {
        "queryDescription": payload.description,
        "primaryBrand": primary_brand,
        "matchedBrands": matches,
        "results": recs,
    }
