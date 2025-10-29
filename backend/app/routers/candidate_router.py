from fastapi import APIRouter, Query
from ..schemas import CandidateDetailResponse
from ..services.recommend import (
    get_persona_for_artist,
    get_past_brands_for_artist,
    get_similar_artists,
    guess_score_for_artist_brand,
)

router = APIRouter(prefix="/candidate", tags=["candidate"])

@router.get("/{artist}", response_model=CandidateDetailResponse)
def api_candidate_detail(
    artist: str,
    brand: str | None = Query(default=None),
):
    persona_text = get_persona_for_artist(artist)
    past_brands = get_past_brands_for_artist(artist)
    similar_list = get_similar_artists(artist, top_k=5)

    if brand:
        score_val = guess_score_for_artist_brand(artist, brand)
    else:
        score_val = (
            guess_score_for_artist_brand(artist, past_brands[0])
            if past_brands else
            7.5
        )

    return {
        "name": artist,
        "score": score_val,
        "persona": persona_text or "（此藝人尚無詳細介紹）",
        "reasonText": "",
        "pastBrands": past_brands,
        "similarArtists": similar_list,
    }