"""
backend/agents/grading_agent.py
"""
from core.llm import llm

GRADE_SCALE = [
    (90, "A+", "Outstanding"),
    (80, "A",  "Excellent"),
    (70, "B",  "Good"),
    (60, "C",  "Satisfactory"),
    (50, "D",  "Pass"),
    ( 0, "F",  "Fail"),
]


class GradingAgent:

    def parse_answers(self, ocr_text: str, questions: list) -> dict:
        nums = [q.get("number", f"Q{i+1}") for i, q in enumerate(questions)]
        prompt = f"""Map handwritten answers to question numbers.
Questions in this paper: {nums}

FULL OCR TEXT:
{ocr_text[:3000]}

Return ONLY JSON: {{"Q1":"answer text","Q2":"answer text"}}
Use "No answer provided" for missing answers."""
        result = llm.ask_json(prompt, cache=False)
        if not isinstance(result, dict):
            result = {}
        for n in nums:
            result.setdefault(n, "No answer provided")
        return result

    def grade_one(self, q_num: str, student_ans: str,
                  model_ans: str, marks: int, topic: str) -> dict:
        prompt = f"""Grade this exam answer strictly but fairly.

Q{q_num} | Topic: {topic} | Max marks: {marks}
MODEL ANSWER: {model_ans}
STUDENT ANSWER: {student_ans}

Award marks for every correct concept. Apply partial credit fairly.
Return ONLY JSON:
{{
  "marks_awarded": <int 0-{marks}>,
  "grade": "Excellent|Good|Satisfactory|Needs Improvement|Incorrect",
  "correct_points": ["point1","point2"],
  "missing_points": ["missing1","missing2"],
  "feedback": "2-3 sentences of actionable feedback"
}}"""
        r = llm.ask_json(prompt, cache=False)
        if not isinstance(r, dict) or "marks_awarded" not in r:
            r = {
                "marks_awarded": int(marks * 0.5),
                "grade": "Satisfactory",
                "correct_points": [],
                "missing_points": ["Could not fully parse answer"],
                "feedback": "Partially correct. Review topic carefully.",
            }
        awarded = max(0, min(marks, int(r.get("marks_awarded", 0))))
        r["marks_awarded"]  = awarded
        r["marks_total"]    = marks
        r["percentage"]     = round(awarded / marks * 100, 1) if marks > 0 else 0
        r["student_answer"] = student_ans[:400]
        return r

    @staticmethod
    def letter_grade(pct: float) -> tuple[str, str]:
        for threshold, letter, desc in GRADE_SCALE:
            if pct >= threshold:
                return letter, desc
        return "F", "Fail"

    def build_report(self, results: dict, mock: dict,
                     earned: float, total: float, pct: float) -> str:
        letter, desc = self.letter_grade(pct)
        lines = [
            "=" * 62,
            "        GRADE REPORT  —  EduAgent AI",
            "=" * 62,
            f"  Subject  : {mock.get('subject','N/A')}",
            f"  Score    : {earned:.0f}/{total}  ({pct:.1f}%)  Grade {letter} — {desc}",
            "=" * 62,
        ]
        for qn, r in results.items():
            icon = "✅" if r.get("percentage",0)>=70 else ("⚠️" if r.get("percentage",0)>=50 else "❌")
            lines.append(f"\n{icon}  {qn}: {r['marks_awarded']}/{r['marks_total']} ({r.get('percentage',0):.0f}%) — {r.get('grade','')}")
            if r.get("correct_points"):
                lines.append("   ✔  " + " | ".join(r["correct_points"][:3]))
            if r.get("missing_points"):
                lines.append("   ✘  " + " | ".join(r["missing_points"][:3]))
            lines.append(f"   💬 {r.get('feedback','')}")
        lines += ["", "=" * 62, f"  FINAL GRADE  →  {letter}  ({pct:.1f}%)", "=" * 62]
        return "\n".join(lines)

    def post_grade_feedback(self, results: dict, score: float,
                            letter: str, subject: str) -> str:
        weak = sorted(
            [(qn, r) for qn, r in results.items() if isinstance(r, dict)],
            key=lambda x: x[1].get("percentage", 100)
        )[:3]
        weak_topics = [r.get("topic", qn) for qn, r in weak]
        prompt = f"""Personalised post-exam feedback.
Subject: {subject} | Score: {score:.1f}% | Grade: {letter}
Weakest areas: {weak_topics}
Write: (1) acknowledge effort (2) top 3 improvements as bullets (3) 48-hour study plan (4) encouragement.
Be warm, honest, specific."""
        return llm.ask(prompt, cache=False)


grading_agent = GradingAgent()
