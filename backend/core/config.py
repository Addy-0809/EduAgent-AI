"""
backend/core/config.py — centralised configuration
"""
import os
from pathlib import Path

ROOT = Path(__file__).parent.parent

class Settings:
    # ── LLM ─────────────────────────────────────────────
    GROQ_API_KEY        = os.getenv("GROQ_API_KEY", "")
    OPENROUTER_API_KEY  = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
    MODEL_PRIMARY       = "llama-3.3-70b-versatile"
    MODEL_FALLBACK      = "deepseek/deepseek-r1"

    # ── Paths ────────────────────────────────────────────
    DATA_DIR        = ROOT / "data"
    DATASET_PATH    = DATA_DIR / "xAPI-Edu-Data.csv"
    MOCK_PDF_DIR    = DATA_DIR / "mock_pdfs"
    UPLOAD_DIR      = DATA_DIR / "uploads"

    # ── API ──────────────────────────────────────────────
    API_HOST        = os.getenv("API_HOST", "0.0.0.0")
    API_PORT        = int(os.getenv("API_PORT", "8000"))
    CORS_ORIGINS    = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,https://*.streamlit.app"
    ).split(",")

    # ── LLM params ───────────────────────────────────────
    TEMPERATURE = 0.7
    MAX_TOKENS  = 2048

    @classmethod
    def setup(cls):
        for d in [cls.DATA_DIR, cls.MOCK_PDF_DIR, cls.UPLOAD_DIR]:
            d.mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.setup()
