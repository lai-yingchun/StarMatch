from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import tensorflow as tf
from dotenv import load_dotenv
import os
import openai

# =========================
# 0. 載入模型 & 資料
# =========================

def l2_normalize_layer(x):
    return tf.nn.l2_normalize(x, axis=-1)

print(">> Loading data...")

df_joined = pd.read_pickle("df_joined.pkl")
df_persona = pd.read_pickle("df_persona.pkl")
brand_personality = pd.read_pickle("brand_personality_description.pkl")

brand_encoder = tf.keras.models.load_model(
    "brand_encoder_model.keras",
    custom_objects={"l2_normalize_layer": l2_normalize_layer},
)
celeb_proj = tf.keras.models.load_model(
    "celeb_proj_model.keras",
    custom_objects={"l2_normalize_layer": l2_normalize_layer},
)

print(">> Data loaded.")

# =========================
# 1. 欄位定義
# =========================

brand_cols = [f"bd_dim{i}" for i in range(1024)]

demographic_cols = [
    "gender",
    "10-20", "20-30", "30-40", "40-50", "50-60",
    "60-70", "70-80", "80-90",
]

product_cat_cols = [
    "公益慈善",
    "名牌珠寶精品",
    "居家生活",
    "手機電腦",
    "汽車機車自行車",
    "生活家電",
    "美妝保養",
    "美食生鮮與日用品",
    "行李箱與旅行相關配件",
    "軟體電玩遊戲",
    "運動健身戶外",
    "醫療保健",
    "鞋包服飾",
]

celeb_vec_cols = [f"dim{i}" for i in range(1024)]

CELEB_ID_COL = "artist"
BRAND_COL = "brand"

# =========================
# 2. 名人向量預先投影
# =========================

all_celeb_vectors = df_joined[celeb_vec_cols].to_numpy().astype(np.float32)
all_celeb_ids = df_joined[CELEB_ID_COL].to_numpy()

all_celeb_embeds = celeb_proj.predict(all_celeb_vectors, verbose=0)
all_celeb_embeds /= np.linalg.norm(all_celeb_embeds, axis=1, keepdims=True)

# =========================
# 3. 小工具
# =========================

AGE_BUCKET_COLS = [
    "10-20", "20-30", "30-40", "40-50", "50-60",
    "60-70", "70-80", "80-90",
]

def get_artist_gender(artist_name: str) -> float | None:
    """
    回傳這位藝人的 gender (0/1)，直接從 df_joined。
    如果多列則取平均再四捨五入。
    假設：1 = 男性, 0 = 女性
    如果你的資料定義相反，對調下面兩行判斷就好。
    """
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
    """
    回傳 True 表示：此藝人的年齡 bucket 完全落在 [min_age, max_age] 內
    （即：藝人的年齡真的在 user 指定範圍內）

    規則：
    - 如果 min_age / max_age 都沒給 -> 不篩 (回 True)
    - 假設 df_joined 的欄位 "20-30" = 1 代表此藝人年齡落在 20~30
    - 我們只接受「整個 bucket 在範圍裡」
      例：查 20~30   -> 只接受 bucket 20-30
          查 20~40   -> 接受 20-30, 30-40
          查 30~35   -> 不接受任何 bucket，因為沒完全落在 30~35
    """

    if min_age is None and max_age is None:
        return True  # 沒有限制年齡

    sub = df_joined[df_joined[CELEB_ID_COL] == artist_name]
    if sub.empty:
        return False

    # user 沒給的那邊，用無限大/小補
    q_min = min_age if min_age is not None else -10**9
    q_max = max_age if max_age is not None else 10**9

    # 檢查每個年齡 bucket
    for col in AGE_BUCKET_COLS:  # ["10-20", "20-30", ...]
        if col not in sub.columns:
            continue

        # 如果這個 bucket 對這個藝人有標 1，表示「藝人屬於這個年齡段」
        if sub[col].fillna(0).astype(float).max() >= 1.0:
            try:
                low_s, high_s = col.split("-")
                low_v = int(low_s)
                high_v = int(high_s)
            except:
                continue

            # ✨ 這裡跟舊版不一樣：
            # 我們要求這個 bucket 完整落在 [q_min, q_max] 裡面
            fully_inside = (low_v >= q_min) and (high_v <= q_max)

            if fully_inside:
                return True

    return False
    
def encode_brand_feature_row(row: pd.Series) -> np.ndarray:
    vec = row[brand_cols + demographic_cols + product_cat_cols] \
        .to_numpy() \
        .astype(np.float32)
    return vec.reshape(1, -1)

def cosine_to_score(sim_raw: float) -> float:
    score_0_10 = (sim_raw + 1.0) / 2.0 * 10.0
    return round(float(score_0_10), 2)

def recommend_artists_for_brand(
    brand_name: str,
    top_k: int = 10,
    artist_gender_filter: str | None = None,  # "M" / "F" / None
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

    filtered: list[dict] = []
    for artist_name, data in best_by_artist.items():
        if artist_gender_filter in ["M", "F"]:
            g_val = get_artist_gender(artist_name)  # 1.0=男,0.0=女,None=未知
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

def get_similar_artists(target_artist: str, top_k: int = 5):
    """
    找和 target_artist 最相似的其他藝人
    依照 cosine similarity (在 celeb_proj 空間)
    回傳類似藝人的「名字」列表
    """
    # 找出這個藝人在 all_celeb_ids 裡所有出現的位置
    idxs = np.where(all_celeb_ids == target_artist)[0]
    if len(idxs) == 0:
        return []

    # 這個藝人可能在 df_joined 有多列，我們把他的 embedding 取平均
    target_embed = all_celeb_embeds[idxs].mean(axis=0)
    target_embed /= np.linalg.norm(target_embed)

    # 跟所有藝人做 cosine
    sims = np.dot(all_celeb_embeds, target_embed)  # shape (num_celeb,)
    sorted_idx = np.argsort(sims)[::-1]            # 大到小排序

    unique_sim = {}
    for idx in sorted_idx:
        cid = all_celeb_ids[idx]
        if cid == target_artist:
            continue  # 跳過本人
        if cid not in unique_sim:
            # 我們用 cosine_to_score 把相似度轉成 0~10，但目前前端只要名字
            unique_sim[cid] = cosine_to_score(sims[idx])
        if len(unique_sim) >= top_k:
            break

    # 回傳只要名字 (依照分數高到低)
    return [
        name
        for (name, _) in sorted(
            unique_sim.items(),
            key=lambda x: x[1],
            reverse=True,
        )
    ]

def get_past_brands_for_artist(artist_name: str):
    rows = df_joined[df_joined[CELEB_ID_COL] == artist_name]
    return rows[BRAND_COL].dropna().unique().tolist()

def get_brand_desc(brand_name: str) -> str:
    if "brand" not in brand_personality.columns:
        return ""
    if "desc" not in brand_personality.columns:
        return ""
    row_b = brand_personality[brand_personality["brand"] == brand_name]
    if row_b.empty:
        return ""
    return str(row_b["desc"].iloc[0])

def get_persona_for_artist(artist_name: str) -> str:
    if "artist" not in df_persona.columns:
        return ""
    if "persona" not in df_persona.columns:
        return ""
    sub = df_persona[df_persona["artist"] == artist_name]
    if sub.empty:
        return ""
    return str(sub["persona"].iloc[0])

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

# =========================
# 4. Response Models
# =========================

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

# =========================
# 5. FastAPI App
# =========================

app = FastAPI(
    title="StarMatch API",
    description="Backend for brand→artist recommendations",
    version="1.0.0",
)

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 6. Endpoints
# =========================

@app.get("/recommendations/{brand}", response_model=RecommendationResponse)
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
    """
    你可以帶：
    /recommendations/蘋果?artistGender=M&minAge=20&maxAge=30
    /recommendations/蘋果?minAge=40
    /recommendations/蘋果?artistGender=F
    都可以。沒帶就不篩那個條件。
    """
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


@app.get("/candidate/{artist}", response_model=CandidateDetailResponse)
def api_candidate_detail(artist: str, brand: str | None = None):
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


@app.get("/explanation/{brand}/{artist}")
def get_explanation(brand: str, artist: str):
    """
    回傳「為什麼這個品牌應該找這個藝人」的 pitch。
    會呼叫 LLM（openai.chat.completions），如果 LLM 失敗就給備用文案。
    """

    # 1. 蒐集上下文資料
    brand_desc = get_brand_desc(brand) or "（暫無品牌描述）"

    artist_persona = get_persona_for_artist(artist) or "（暫無藝人描述）"

    past_brands = get_past_brands_for_artist(artist) or []

    similar_list = get_similar_artists(artist, top_k=5) or []

    # 2. 算品牌×藝人契合度分數（0~10）
    match_score = guess_score_for_artist_brand(artist, brand)

    # 3. 整理 prompt
    user_prompt = f"""
                    [品牌敘述]
                    {brand}：
                    {brand_desc}

                    [藝人敘述]
                    {artist}：
                    {artist_persona}

                    [該藝人曾經合作或代言過的品牌類型 / 品牌示例]
                    {", ".join(past_brands) if past_brands else "（無資料）"}

                    [受眾/市場推測]
                    和 {artist} 相近、可替代或氣質接近的其他藝人：
                    {", ".join(similar_list) if similar_list else "（無資料）"}

                    [品牌與藝人的整體契合度分數 (0~10 越高越契合)]
                    {match_score} / 10

                    請根據以上資料，告訴行銷主管：
                    1. 為什麼「{brand}」應該優先考慮「{artist}」，而不是一個隨便的名人。
                    2. 這位藝人可以幫品牌具體加強什麼品牌印象（風格、價值、信任感、族群共鳴、使用情境等）。
                    3. 哪一群消費族群、哪種溝通場景（例如生活感、專業度、潮流度、親民度、性能訴求...）會特別容易被說服。

                    輸出規格：
                    - 請用繁體中文。
                    - 請寫成一段 2~3 句流暢的提案語氣，不要條列式。
                    - 請務必使用品牌名稱「{brand}」與藝人名稱「{artist}」具名描述，而不是代稱。
                    - 不要只講藝人「很紅」「很有影響力」，要講『為什麼他跟這個牌子的品牌語氣/族群對得上』。
                    - 字數上限約 120 字。
                """.strip()

    # 4. Call OpenAI
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",   # 你原本用的這個
            messages=[
                {
                    "role": "system",
                    "content": (
                        "你是品牌策略顧問，專門幫行銷長準備提案簡報。"
                        "你的重點是『品牌 fit』跟『溝通對象的命中率』，"
                        "而不是泛泛而談的稱讚。"
                    ),
                },
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=220,
        )

        reason = response.choices[0].message.content.strip()

        return {
            "brand": brand,
            "artist": artist,
            "recommendation_reason": reason,
            "score": match_score,
        }

    except Exception as e:
        # 如果 LLM 掛了，就回一段安全的備援文字，至少不會 500
        fallback = (
            f"{artist} 的形象與 {brand} 的品牌定位具有高度契合，"
            f"能強化品牌在目標族群中的吸引力與可信度。"
        )
        return {
            "brand": brand,
            "artist": artist,
            "recommendation_reason": f"(LLM 生成失敗，使用備用描述) {fallback}",
            "score": match_score,
            "error": str(e),
        }

@app.get("/health")
def api_health():
    return {"status": "ok"}