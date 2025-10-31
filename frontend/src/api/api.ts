const API_BASE = "http://127.0.0.1:8000";

export type Recommendation = {
  id: string;
  name: string;
  score: number;
};

export type CandidateDetailVM = {
  id: string;
  name: string;
  score: number;
  persona: string;
  reasonText: string;
  pastBrands: string[];
  similarArtists: string[];
};

export type BrandMatch = {
  brand: string;
  similarity: number;
};

export type DescriptionRecommendation = {
  queryDescription: string;
  primaryBrand: string | null;
  matchedBrands: BrandMatch[];
  results: Recommendation[];
};

export async function recommendForBrand(
  brand: string,
  opts: {
    topK?: number;
    artistGender?: string;
    minAge?: number;
    maxAge?: number;
  } = {}
): Promise<Recommendation[]> {
  const params = new URLSearchParams();
  params.set("topK", String(opts.topK ?? 10));
  if (opts.artistGender) params.set("artistGender", opts.artistGender);
  if (opts.minAge !== undefined) params.set("minAge", String(opts.minAge));
  if (opts.maxAge !== undefined) params.set("maxAge", String(opts.maxAge));

  const res = await fetch(
    `${API_BASE}/recommendations/${encodeURIComponent(
      brand
    )}?${params.toString()}`,
    { method: "GET", headers: { "Content-Type": "application/json" } }
  );

  if (!res.ok) {
    console.error("recommendForBrand error", res.status);
    return [];
  }

  const data = await res.json();
  return data.results ?? [];
}

export async function getCandidateDetail(
  artistName: string,
  brandName?: string
): Promise<CandidateDetailVM> {
  const url = `${API_BASE}/candidate/${encodeURIComponent(
    artistName
  )}?brand=${encodeURIComponent(brandName ?? "")}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    console.error("getCandidateDetail error", resp.status);
    throw new Error("candidate fetch failed");
  }

  const raw = await resp.json();

  return {
    id: artistName,
    name: raw.name ?? artistName,
    score: raw.score ?? 0,
    persona: raw.persona ?? "（此藝人尚無詳細介紹）",
    reasonText: raw.reasonText ?? "",
    pastBrands: raw.pastBrands ?? [],
    similarArtists: raw.similarArtists ?? [],
  };
}

export async function getLLMExplanation(brandName: string, artistName: string) {
  const url = `${API_BASE}/explanation/${encodeURIComponent(
    brandName
  )}/${encodeURIComponent(artistName)}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    console.error("explanation fetch failed", resp.status);
    return "";
  }
  const data = await resp.json();
  return data.recommendation_reason ?? "";
}

export async function recommendForDescription(
  payload: {
    description: string;
    topK?: number;
    artistGender?: string;
    minAge?: number;
    maxAge?: number;
    productCats?: string[];
  }
): Promise<DescriptionRecommendation> {
  const res = await fetch(`${API_BASE}/recommendations/by-description`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: payload.description,
      topK: payload.topK ?? 10,
      artistGender: payload.artistGender,
      minAge: payload.minAge,
      maxAge: payload.maxAge,
      productCats: payload.productCats ?? [],
    }),
  });

  if (!res.ok) {
    console.error("recommendForDescription error", res.status);
    throw new Error("recommendation by description failed");
  }

  const data = await res.json();
  return {
    queryDescription: data.queryDescription ?? payload.description,
    primaryBrand: data.primaryBrand ?? null,
    matchedBrands: data.matchedBrands ?? [],
    results: data.results ?? [],
  };
}

export async function getLLMExplanationForDescription(opts: {
  artistName: string;
  description: string;
  matchScore?: number;
  brandName?: string | null;
}): Promise<string> {
  const resp = await fetch(`${API_BASE}/explanation/description`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      artist: opts.artistName,
      brandDescription: opts.description,
      matchScore: opts.matchScore,
      brandName: opts.brandName ?? undefined,
    }),
  });

  if (!resp.ok) {
    console.error("explanation description fetch failed", resp.status);
    return "";
  }

  const data = await resp.json();
  return data.recommendation_reason ?? "";
}
