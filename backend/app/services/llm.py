import os
from dotenv import load_dotenv
import openai
from .context_data import (
    get_brand_desc,
    get_persona_for_artist,
    get_past_brands_for_artist,
    get_similar_artists,
    guess_score_for_artist_brand,
)

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def build_recommendation_pitch(
    brand: str,
    artist: str,
    *,
    brand_desc_override: str | None = None,
    match_score_override: float | None = None,
) -> dict:
    brand_desc = (
        brand_desc_override.strip()
        if brand_desc_override and brand_desc_override.strip()
        else get_brand_desc(brand)
    ) or "（暫無品牌描述）"
    artist_persona = get_persona_for_artist(artist) or "（暫無藝人描述）"
    past_brands = get_past_brands_for_artist(artist) or []
    similar_list = get_similar_artists(artist, top_k=5) or []
    match_score = (
        float(match_score_override)
        if match_score_override is not None
        else guess_score_for_artist_brand(artist, brand)
    )

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
                    1. 為什麼「{brand}」應該優先考慮「{artist}」。
                    2. 這位藝人可以幫品牌具體加強什麼品牌印象。
                    3. 哪一群消費族群、哪種溝通場景會特別容易被說服。

                    輸出規格：
                    - 繁體中文。
                    - 2~3 句順口提案，不要條列。
                    - 字數上限約 120 字。
                    - 一定要點名 {brand} 和 {artist}。
                    - 不要只說「很紅」，要說品牌語氣/族群 fit。
                """.strip()

    try:
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "你是品牌策略顧問，專門幫行銷長準備提案簡報。"
                        "你的重點是『品牌 fit』跟『溝通對象的命中率』"
                    ),
                },
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=220,
        )

        reason = resp.choices[0].message.content.strip()
        return {
            "brand": brand,
            "artist": artist,
            "recommendation_reason": reason,
            "score": match_score,
        }
    except Exception as e:
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
