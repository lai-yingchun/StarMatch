from ..data_loader import (
    df_joined,
    all_celeb_ids,
    all_celeb_embeds,
    CELEB_ID_COL,
    BRAND_COL,
    AGE_BUCKET_COLS,
)
from .context_data import (
    encode_brand_feature_row,
    cosine_to_score,
    get_similar_artists,
    get_past_brands_for_artist,
    get_persona_for_artist,
    get_brand_desc,
    guess_score_for_artist_brand,
    build_brand_feature_from_embedding,
)
from .embedding import get_voyage_embedding
import numpy as np

def get_artist_gender(artist_name: str) -> float | None:
    sub = df_joined[df_joined[CELEB_ID_COL] == artist_name]
    if sub.empty or "gender" not in sub.columns:
        return None
    g_mean = float(sub["gender"].mean())
    return 1.0 if g_mean >= 0.5 else 0.0

def artist_is_within_age_range_strict(
    artist_name: str,
    min_age: int | None,
    max_age: int | None,
) -> bool:
    if min_age is None and max_age is None:
        return True

    sub = df_joined[df_joined[CELEB_ID_COL] == artist_name]
    if sub.empty:
        return False

    q_min = min_age if min_age is not None else -10**9
    q_max = max_age if max_age is not None else 10**9

    for col in AGE_BUCKET_COLS:
        if col not in sub.columns:
            continue
        if sub[col].fillna(0).astype(float).max() >= 1.0:
            try:
                lo_s, hi_s = col.split("-")
                lo_v = int(lo_s)
                hi_v = int(hi_s)
            except:
                continue
            fully_inside = (lo_v >= q_min) and (hi_v <= q_max)
            if fully_inside:
                return True
    return False

def recommend_artists_for_brand(
    brand_name: str,
    top_k: int = 10,
    artist_gender_filter: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
):
    brand_rows = df_joined[df_joined[BRAND_COL] == brand_name]
    if brand_rows.empty:
        return []

    CANDIDATES_PER_ROW = 100
    gathered = []

    for _, brow in brand_rows.iterrows():
        brand_feat = encode_brand_feature_row(brow)
        from ..data_loader import brand_encoder
        brand_embed = brand_encoder.predict(brand_feat, verbose=0)
        brand_embed /= np.linalg.norm(brand_embed, axis=1, keepdims=True)

        sims = np.dot(all_celeb_embeds, brand_embed[0])
        sorted_idx = np.argsort(sims)[::-1]

        seen_this_round = set()
        for idx in sorted_idx:
            artist_name = all_celeb_ids[idx]
            if artist_name in seen_this_round:
                continue
            seen_this_round.add(artist_name)

            gathered.append({
                "id": artist_name,
                "name": artist_name,
                "score": cosine_to_score(sims[idx]),
            })

            if len(seen_this_round) >= CANDIDATES_PER_ROW:
                break

    best_by_artist: dict[str, dict] = {}
    for row in gathered:
        nm = row["name"]
        if nm not in best_by_artist or row["score"] > best_by_artist[nm]["score"]:
            best_by_artist[nm] = row

    filtered = []
    for artist_name, data in best_by_artist.items():
        if artist_gender_filter in ["M", "F"]:
            g_val = get_artist_gender(artist_name)
            if g_val is None:
                continue
            want_male = (artist_gender_filter == "M")
            if want_male and g_val != 1.0:
                continue
            if (not want_male) and g_val != 0.0:
                continue

        if not artist_is_within_age_range_strict(artist_name, min_age, max_age):
            continue

        filtered.append(data)

    filtered.sort(key=lambda x: x["score"], reverse=True)
    return filtered[:top_k]

def recommend_artists_by_description(
    description: str,
    top_k: int = 10,
    artist_gender_filter: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
    product_cats: list[str] | None = None,
):
    if not description.strip():
        return None, [], []

    desc_embedding = get_voyage_embedding(description)
    
    brand_feat = build_brand_feature_from_embedding(
        desc_embedding,
        target_gender=artist_gender_filter,
        min_age=min_age,
        max_age=max_age,
        product_cats=product_cats,
    )

    from ..data_loader import brand_encoder

    brand_embed = brand_encoder.predict(brand_feat, verbose=0)
    norm = np.linalg.norm(brand_embed, axis=1, keepdims=True)
    norm[norm == 0] = 1.0
    brand_embed /= norm

    sims = np.dot(all_celeb_embeds, brand_embed[0])
    sorted_idx = np.argsort(sims)[::-1]

    best_by_artist: dict[str, dict] = {}
    for idx in sorted_idx:
        artist_name = all_celeb_ids[idx]

        if artist_gender_filter in ["M", "F"]:
            g_val = get_artist_gender(artist_name)
            if g_val is None:
                continue
            want_male = (artist_gender_filter == "M")
            if want_male and g_val != 1.0:
                continue
            if (not want_male) and g_val != 0.0:
                continue

        if not artist_is_within_age_range_strict(artist_name, min_age, max_age):
            continue

        score_val = cosine_to_score(sims[idx])
        existing = best_by_artist.get(artist_name)
        if existing is None or score_val > existing["score"]:
            best_by_artist[artist_name] = {
                "id": artist_name,
                "name": artist_name,
                "score": score_val,
            }

        if len(best_by_artist) >= top_k and existing is None:
            # we have collected enough unique artists; can stop early
            break

    results = sorted(
        best_by_artist.values(),
        key=lambda x: x["score"],
        reverse=True,
    )
    return None, [], results[:top_k]

__all__ = [
    "recommend_artists_for_brand",
    "get_persona_for_artist",
    "get_past_brands_for_artist",
    "get_similar_artists",
    "get_brand_desc",
    "guess_score_for_artist_brand",
    "recommend_artists_by_description",
]
