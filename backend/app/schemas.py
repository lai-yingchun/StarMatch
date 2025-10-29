from pydantic import BaseModel

class RecommendationItem(BaseModel):
    id: str
    name: str
    score: float

class RecommendationResponse(BaseModel):
    brand: str
    results: list[RecommendationItem]

class CandidateDetailResponse(BaseModel):
    name: str
    score: float
    persona: str
    reasonText: str
    pastBrands: list[str]
    similarArtists: list[str]