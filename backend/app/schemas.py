from pydantic import BaseModel

class RecommendationItem(BaseModel):
    id: str
    name: str
    score: float

class RecommendationResponse(BaseModel):
    brand: str
    results: list[RecommendationItem]

class DescriptionRecommendRequest(BaseModel):
    description: str
    topK: int = 10
    artistGender: str | None = None
    minAge: int | None = None
    maxAge: int | None = None
    productCats: list[str] | None = None

class BrandMatch(BaseModel):
    brand: str
    similarity: float

class DescriptionRecommendationResponse(BaseModel):
    queryDescription: str
    primaryBrand: str | None
    matchedBrands: list[BrandMatch]
    results: list[RecommendationItem]

class ExplanationDescriptionRequest(BaseModel):
    artist: str
    brandDescription: str
    matchScore: float | None = None
    brandName: str | None = None

class CandidateDetailResponse(BaseModel):
    name: str
    score: float
    persona: str
    reasonText: str
    pastBrands: list[str]
    similarArtists: list[str]
