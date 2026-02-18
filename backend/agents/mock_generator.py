"""
backend/agents/mock_generator.py
"""
import json, uuid
from datetime import datetime
from core.llm import llm
from core.config import settings


class MockGeneratorAgent:

    def generate(self, analysis: dict) -> list:
        n   = max(len(analysis.get("questions", [])), 6)
        sub = analysis.get("subject", "CS")
        top = analysis.get("topics", ["General"])
        tot = analysis.get("total_marks", 100)
        dif = analysis.get("difficulty_distribution", {})
        qtp = analysis.get("type_distribution", {})
        ori = json.dumps(analysis.get("questions", [])[:4], indent=2)

        prompt = f"""You are setting a NEW exam paper for: {sub}

Original paper info — Topics: {top} | Total marks: {tot}
Difficulty split: {dif} | Question types: {qtp}

ORIGINAL QUESTIONS (style reference only — do NOT reuse):
{ori}

Write {n} BRAND NEW questions. Rules:
1. Cover same topics, match difficulty split and question types
2. Marks must sum to exactly {tot}
3. Include full model answers for the marking scheme

Return ONLY a JSON array:
[{{
  "number": "Q1",
  "text": "complete question text",
  "marks": 10,
  "type": "theory|MCQ|numerical|coding|diagram",
  "difficulty": "easy|medium|hard",
  "topic": "specific topic",
  "sub_parts": [{{"label":"a","text":"sub-question","marks":5}}],
  "model_answer": "complete model answer"
}}]"""

        qs = llm.ask_json(prompt, cache=False)
        if not isinstance(qs, list) or not qs:
            each = tot // n
            qs = [
                {
                    "number": f"Q{i+1}",
                    "text": f"Question {i+1} on {top[i % len(top)]}",
                    "marks": each,
                    "type": "theory",
                    "difficulty": "medium",
                    "topic": top[0],
                    "sub_parts": [],
                    "model_answer": "Refer to course textbook.",
                }
                for i in range(n)
            ]
        return qs

    def export_pdf(self, mock: dict, filename: str) -> str:
        path = str(settings.MOCK_PDF_DIR / filename)
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors
            from reportlab.lib.units import inch
            from reportlab.platypus import (
                SimpleDocTemplate, Paragraph, Spacer, Table,
                TableStyle, HRFlowable
            )

            doc    = SimpleDocTemplate(path, pagesize=A4,
                                       leftMargin=inch, rightMargin=inch,
                                       topMargin=inch, bottomMargin=inch)
            styles = getSampleStyleSheet()
            T = ParagraphStyle("T", parent=styles["Title"], fontSize=16,
                               spaceAfter=4, alignment=1, fontName="Helvetica-Bold")
            Q = ParagraphStyle("Q", parent=styles["Normal"], fontSize=11,
                               spaceAfter=6, leading=16)
            S = ParagraphStyle("S", parent=styles["Normal"], fontSize=10,
                               spaceAfter=4, leftIndent=24, leading=15)
            A = ParagraphStyle("A", parent=styles["Normal"], fontSize=10,
                               spaceAfter=6, textColor=colors.grey,
                               leftIndent=12, leading=14)
            DL = {"easy": "[E]", "medium": "[M]", "hard": "[H]"}
            story = []
            story.append(Paragraph("MOCK EXAMINATION PAPER", T))
            story.append(Paragraph(mock.get("subject", ""), T))
            story.append(Spacer(1, 4))
            info = Table(
                [["Total Marks:", str(mock.get("total_marks", 100)),
                  "Duration:", mock.get("duration", "3 Hours")]],
                colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch],
            )
            info.setStyle(TableStyle([
                ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
                ("FONTNAME", (2,0), (2,-1), "Helvetica-Bold"),
                ("FONTSIZE", (0,0), (-1,-1), 10),
                ("GRID",     (0,0), (-1,-1), 0.25, colors.lightgrey),
                ("PADDING",  (0,0), (-1,-1), 4),
            ]))
            story.append(info)
            story.append(Spacer(1, 8))
            story.append(HRFlowable(width="100%", thickness=1.5, color=colors.darkblue))
            story.append(Spacer(1, 8))
            story.append(Paragraph(
                "<b>Instructions:</b> Answer all questions. Show all working.",
                styles["Normal"]))
            story.append(Spacer(1, 12))

            for i, q in enumerate(mock.get("questions", []), 1):
                dl = DL.get(q.get("difficulty", "medium"), "")
                story.append(Paragraph(
                    f"<b>{q.get('number','Q'+str(i))}.  "
                    f"[{q.get('marks',0)} marks]  {dl}</b><br/>{q.get('text','')}",
                    Q))
                for sp in q.get("sub_parts", []):
                    story.append(Paragraph(
                        f"({sp.get('label','a')}) {sp.get('text','')} "
                        f"<i>[{sp.get('marks',0)} m]</i>", S))
                story.append(Spacer(1, 8))

            story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
            story.append(Spacer(1, 8))
            story.append(Paragraph("<b>MARKING SCHEME (Examiner Use Only)</b>", T))
            story.append(Spacer(1, 8))
            for i, q in enumerate(mock.get("questions", []), 1):
                story.append(Paragraph(
                    f"<b>{q.get('number','Q'+str(i))} ({q.get('marks',0)} marks):</b>", Q))
                story.append(Paragraph(q.get("model_answer", ""), A))
                story.append(Spacer(1, 6))

            doc.build(story)
            return path
        except Exception as e:
            print(f"PDF export failed: {e}")
            return ""


mock_generator = MockGeneratorAgent()
