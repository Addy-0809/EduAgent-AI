"""
backend/core/models.py — Pydantic schemas for FastAPI endpoints
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


# ── Shared ────────────────────────────────────────────────

class Question(BaseModel):
    number:     str
    text:       str
    marks:      int
    type:       str   # theory | MCQ | coding | numerical | diagram
    difficulty: str   # easy | medium | hard
    topic:      str
    sub_parts:  List[Dict[str, Any]] = []
    model_answer: str = ""


class MockPaper(BaseModel):
    subject:     str
    total_marks: int
    duration:    str
    questions:   List[Question]
    created_at:  str = ""


# ── Paper Analysis ────────────────────────────────────────

class AnalysePaperRequest(BaseModel):
    text: str = Field(..., description="Raw extracted text of the exam paper")


class PaperAnalysis(BaseModel):
    subject:                  str
    total_marks:              int
    estimated_duration:       str
    topics:                   List[str]
    questions:                List[Dict[str, Any]]
    difficulty_distribution:  Dict[str, int]
    type_distribution:        Dict[str, int]
    key_concepts:             List[str]


class AnalysePaperResponse(BaseModel):
    analysis:   PaperAnalysis
    mock_paper: MockPaper
    pdf_url:    Optional[str] = None
    session_id: str


# ── Grading ───────────────────────────────────────────────

class GradeRequest(BaseModel):
    mock_paper:  MockPaper
    ocr_text:    str = Field(..., description="Full OCR text from answer sheet photos")
    session_id:  str = ""


class QuestionResult(BaseModel):
    marks_awarded:  int
    marks_total:    int
    percentage:     float
    grade:          str
    correct_points: List[str]
    missing_points: List[str]
    feedback:       str
    student_answer: str = ""


class GradeResponse(BaseModel):
    grading_results: Dict[str, QuestionResult]
    total_score:     float
    grade_letter:    str
    grade_report:    str
    feedback_text:   str
    session_id:      str


# ── Learning ──────────────────────────────────────────────

class LearnRequest(BaseModel):
    goal:       str = Field(..., description="What the student wants to learn")
    session_id: str = ""


class TopicResult(BaseModel):
    topic:    str
    mastery:  float
    content:  str
    questions: List[Dict[str, Any]]
    feedback: str


class LearnResponse(BaseModel):
    learning_path:   List[str]
    topics_covered:  List[TopicResult]
    avg_mastery:     float
    feedback_text:   str
    session_id:      str


# ── Evaluation ────────────────────────────────────────────

class EvalMetrics(BaseModel):
    accuracy:  float
    precision: float
    recall:    float
    f1_score:  float
    baseline:  float
    dataset_size: int


# ── Health ────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status:   str
    llm:      str
    dataset:  int
    version:  str
