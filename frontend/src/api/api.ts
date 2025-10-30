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