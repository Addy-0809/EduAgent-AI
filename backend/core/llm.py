"""
backend/core/llm.py — LLM wrapper with Groq primary, OpenRouter fallback
"""
import hashlib, json
from typing import Any
from core.config import settings


class LLM:
    def __init__(self):
        self._llm     = None
        self._cache: dict[str, str] = {}
        self.provider = "uninitialised"
        self._init()

    def _init(self):
        if settings.GROQ_API_KEY:
            try:
                from langchain_groq import ChatGroq
                self._llm = ChatGroq(
                    model=settings.MODEL_PRIMARY,
                    temperature=settings.TEMPERATURE,
                    max_tokens=settings.MAX_TOKENS,
                    groq_api_key=settings.GROQ_API_KEY,
                )
                self.provider = f"Groq/{settings.MODEL_PRIMARY}"
                print(f"✅ LLM → {self.provider}")
                return
            except Exception as e:
                print(f"⚠️  Groq failed: {e}")

        if settings.OPENROUTER_API_KEY:
            try:
                from langchain_openai import ChatOpenAI
                self._llm = ChatOpenAI(
                    model=settings.MODEL_FALLBACK,
                    temperature=settings.TEMPERATURE,
                    max_tokens=settings.MAX_TOKENS,
                    openai_api_key=settings.OPENROUTER_API_KEY,
                    openai_api_base=settings.OPENROUTER_BASE_URL,
                )
                self.provider = f"OpenRouter/{settings.MODEL_FALLBACK}"
                print(f"✅ LLM → {self.provider}")
            except Exception as e:
                print(f"⚠️  OpenRouter failed: {e}")
        else:
            print("⚠️  No API key found. Set GROQ_API_KEY in .env")

    def ask(self, prompt: str, cache: bool = True) -> str:
        if not self._llm:
            return "[LLM not configured — set GROQ_API_KEY]"
        key = hashlib.md5(prompt.encode()).hexdigest()
        if cache and key in self._cache:
            return self._cache[key]
        try:
            from langchain.schema import HumanMessage
            r = self._llm.invoke([HumanMessage(content=prompt)])
            out = r.content
            if cache:
                self._cache[key] = out
            return out
        except Exception as e:
            return f"[LLM error: {e}]"

    def ask_json(self, prompt: str, cache: bool = True) -> Any:
        raw = self.ask(prompt, cache=cache)
        for tag in ["```json", "```"]:
            if tag in raw:
                raw = raw.split(tag)[1].split("```")[0]
        try:
            return json.loads(raw.strip())
        except json.JSONDecodeError:
            return {}


llm = LLM()
