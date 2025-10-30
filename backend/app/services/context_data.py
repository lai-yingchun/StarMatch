from ..data_loader import (
    df_joined,
    df_persona,
    brand_personality,
    all_celeb_ids,
    all_celeb_embeds,
    brand_encoder,
    celeb_proj,
    CELEB_ID_COL,
    BRAND_COL,
    AGE_BUCKET_COLS,
    brand_cols,
    demographic_cols,
    product_cat_cols,
)
import numpy as np
import pandas as pd
import tensorflow as tf

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