import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
CORS_ALLOW_ORIGINS = ["*"]
APP_NAME = "StarMatch API"
APP_VERSION = "1.0.0"
APP_DESC = "Backend for brand→artist recommendations"