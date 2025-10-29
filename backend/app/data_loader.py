import os
import pandas as pd
import numpy as np
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSET_ROOT = os.path.join(BASE_DIR, "..", "assets")
DATA_DIR = os.path.join(ASSET_ROOT, "data")
MODEL_DIR = os.path.join(ASSET_ROOT, "models")

def l2_normalize_layer(x):
    return tf.nn.l2_normalize(x, axis=-1)

# === Load Pickle Data ===
df_joined = pd.read_pickle(os.path.join(DATA_DIR, "df_joined.pkl"))
df_persona = pd.read_pickle(os.path.join(DATA_DIR, "df_persona.pkl"))
brand_personality = pd.read_pickle(os.path.join(DATA_DIR, "brand_personality_description.pkl"))

# === Load Keras Models ===
brand_encoder = tf.keras.models.load_model(
    os.path.join(MODEL_DIR, "brand_encoder_model.keras"),
    custom_objects={"l2_normalize_layer": l2_normalize_layer},
)
celeb_proj = tf.keras.models.load_model(
    os.path.join(MODEL_DIR, "celeb_proj_model.keras"),
    custom_objects={"l2_normalize_layer": l2_normalize_layer},
)

print(">> Data loaded.")

# --- column definitions (constants) ---

CELEB_ID_COL = "artist"
BRAND_COL = "brand"

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

AGE_BUCKET_COLS = [
    "10-20", "20-30", "30-40", "40-50", "50-60",
    "60-70", "70-80", "80-90",
]

# --- precompute celeb embeddings in brand space ---
all_celeb_vectors = df_joined[celeb_vec_cols].to_numpy().astype(np.float32)
all_celeb_ids = df_joined[CELEB_ID_COL].to_numpy()

all_celeb_embeds = celeb_proj.predict(all_celeb_vectors, verbose=0)
all_celeb_embeds /= np.linalg.norm(all_celeb_embeds, axis=1, keepdims=True)