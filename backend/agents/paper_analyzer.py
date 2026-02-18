"""
backend/agents/paper_analyzer.py
"""
from core.llm import llm


class PaperAnalyzerAgent:

    def extract_pdf(self, path: str) -> str:
        try:
            import fitz
            doc  = fitz.open(path)
            text = "\n".join(p.get_text() for p in doc)
            doc.close()
            return text.strip()
        except Exception as e:
            return f"[PDF extraction error: {e}]"

    def extract_image(self, path: str) -> str:
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(path).convert("L")
            return pytesseract.image_to_string(img, config="--psm 6").strip()
        except Exception as e:
            return f"[Image OCR error: {e}]"

    def analyse(self, paper_text: str) -> dict:
        prompt = f"""You are an expert examiner. Analyse this exam paper precisely.

PAPER TEXT:
{paper_text[:4000]}

Return ONLY valid JSON — no other text, no markdown:
{{
  "subject": "full subject name",
  "total_marks": 100,
  "estimated_duration": "3 hours",
  "topics": ["topic1", "topic2"],
  "questions": [
    {{
      "number": "Q1",
      "text": "question text (first 150 chars)",
      "marks": 10,
      "type": "theory|MCQ|numerical|coding|diagram",
      "difficulty": "easy|medium|hard",
      "topic": "specific topic"
    }}
  ],
  "difficulty_distribution": {{"easy": 30, "medium": 50, "hard": 20}},
  "type_distribution": {{"theory": 60, "coding": 20, "MCQ": 20}},
  "key_concepts": ["c1", "c2", "c3"]
}}"""

        result = llm.ask_json(prompt, cache=False)
        if not result or "subject" not in result:
            result = {
                "subject": "Computer Science",
                "total_marks": 100,
                "estimated_duration": "3 hours",
                "topics": ["General CS"],
                "questions": [],
                "difficulty_distribution": {"easy": 33, "medium": 34, "hard": 33},
                "type_distribution": {"theory": 100},
                "key_concepts": [],
            }
        return result


paper_analyzer = PaperAnalyzerAgent()
