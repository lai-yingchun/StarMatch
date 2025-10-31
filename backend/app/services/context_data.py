from ..data_loader import (
    df_joined,
    df_persona,
    brand_personality,
    all_celeb_ids,
    all_celeb_embeds,
    brand_encoder,
    CELEB_ID_COL,
    BRAND_COL,
    AGE_BUCKET_COLS,
    brand_cols,
    demographic_cols,
    product_cat_cols,
)
import numpy as np
import pandas as pd

def encode_brand_feature_row(row: pd.Series) -> np.ndarray:
    vec = row[brand_cols + demographic_cols + product_cat_cols] \
        .to_numpy() \
        .astype(np.float32)
    return vec.reshape(1, -1)

def cosine_to_score(sim_raw: float) -> float:
    score_0_10 = (sim_raw + 1.0) / 2.0 * 10.0
    return round(float(score_0_10), 2)

def get_persona_for_artist(artist_name: str) -> str:
    if "artist" not in df_persona.columns or "persona" not in df_persona.columns:
        return ""
    sub = df_persona[df_persona["artist"] == artist_name]
    if sub.empty:
        return ""
    return str(sub["persona"].iloc[0])

def get_past_brands_for_artist(artist_name: str):
    rows = df_joined[df_joined[CELEB_ID_COL] == artist_name]
    return rows[BRAND_COL].dropna().unique().tolist()

def get_brand_desc(brand_name: str) -> str:
    if "brand" not in brand_personality.columns or "desc" not in brand_personality.columns:
        return ""
    row_b = brand_personality[brand_personality["brand"] == brand_name]
    if row_b.empty:
        return ""
    return str(row_b["desc"].iloc[0])

def build_brand_feature_from_embedding(
    embedding: np.ndarray,
    target_gender: str | None,
    min_age: int | None,
    max_age: int | None,
    product_cats: list[str] | None = None,
) -> np.ndarray:
    total_dim = len(brand_cols) + len(demographic_cols) + len(product_cat_cols)
    feat = np.zeros(total_dim, dtype=np.float32)

    brand_dim = len(brand_cols)
    emb = np.asarray(embedding, dtype=np.float32).flatten()
    emb_len = min(emb.shape[0], brand_dim)
    if emb_len > 0:
        feat[:emb_len] = emb[:emb_len]

    gender_idx = brand_dim  # first demographic column
    gender_val = 0.5
    if target_gender == "M":
        gender_val = 1.0
    elif target_gender == "F":
        gender_val = 0.0
    feat[gender_idx] = gender_val

    prod_start = brand_dim + len(demographic_cols)
    if product_cats:
        cat_set = {c.strip() for c in product_cats if c.strip()}
        for idx, cat in enumerate(product_cat_cols):
            if cat in cat_set:
                feat[prod_start + idx] = 1.0

    if min_age is not None or max_age is not None:
        def bucket_matches(bucket: str) -> bool:
            try:
                lo_s, hi_s = bucket.split("-")
                lo_v = int(lo_s)
                hi_v = int(hi_s)
            except Exception:
                return False
            q_min = min_age if min_age is not None else lo_v
            q_max = max_age if max_age is not None else hi_v
            return not (hi_v <= q_min or lo_v >= q_max)

        for idx, col in enumerate(demographic_cols[1:], start=1):
            feat[brand_dim + idx] = 1.0 if bucket_matches(col) else 0.0
    else:
        for idx in range(1, len(demographic_cols)):
            feat[brand_dim + idx] = 0.0

    return feat.reshape(1, -1)

def get_similar_artists(target_artist: str, top_k: int = 5):
    idxs = np.where(all_celeb_ids == target_artist)[0]
    if len(idxs) == 0:
        return []

    target_embed = all_celeb_embeds[idxs].mean(axis=0)
    target_embed /= np.linalg.norm(target_embed)

    sims = np.dot(all_celeb_embeds, target_embed)
    sorted_idx = np.argsort(sims)[::-1]

    unique_sim = {}
    for idx in sorted_idx:
        cid = all_celeb_ids[idx]
        if cid == target_artist:
            continue
        if cid not in unique_sim:
            unique_sim[cid] = cosine_to_score(sims[idx])
        if len(unique_sim) >= top_k:
            break

    return [
        name
        for (name, _) in sorted(
            unique_sim.items(), key=lambda x: x[1], reverse=True
        )
    ]

def guess_score_for_artist_brand(artist_name: str, brand_name: str) -> float:
    brand_rows = df_joined[df_joined[BRAND_COL] == brand_name]
    if brand_rows.empty:
        return 7.5

    idxs = np.where(all_celeb_ids == artist_name)[0]
    if len(idxs) == 0:
        return 7.5

    artist_embed = all_celeb_embeds[idxs].mean(axis=0)
    artist_embed /= np.linalg.norm(artist_embed, axis=0, keepdims=False)

    best_sim = -1.0
    for _, brow in brand_rows.iterrows():
        brand_feat = encode_brand_feature_row(brow)
        brand_embed = brand_encoder.predict(brand_feat, verbose=0)
        brand_embed /= np.linalg.norm(brand_embed, axis=1, keepdims=True)

        sim = float(np.dot(artist_embed, brand_embed[0]))
        if sim > best_sim:
            best_sim = sim

    return cosine_to_score(best_sim)
