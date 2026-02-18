"""
backend/tests/test_backend.py
pytest test suite for EduAgent AI backend.
Run: pytest tests/ -v --tb=short
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest


# ── Dataset tests ─────────────────────────────────────────

class TestDataset:
    def test_loads(self):
        from core.dataset import dataset
        assert dataset.n > 0

    def test_mastery_in_range(self):
        from core.dataset import dataset
        for eng in [20, 50, 80]:
            m = dataset.compute_mastery(eng)
            assert 0.0 <= m <= 1.0

    def test_baseline_reasonable(self):
        from core.dataset import dataset
        b = dataset.baseline_accuracy()
        assert 50.0 <= b <= 100.0

    def test_summary_keys(self):
        from core.dataset import dataset
        s = dataset.summary()
        for k in ["total_records","avg_engagement","avg_performance","baseline_accuracy"]:
            assert k in s


# ── Paper Analyzer tests ──────────────────────────────────

SAMPLE_PAPER = """
DATA STRUCTURES EXAM — 100 marks
Q1. Define BST. [10 marks]
Q2. Write QuickSort. [20 marks]
Q3. Dynamic Programming — 0/1 Knapsack. [30 marks]
Q4. Dijkstra's algorithm. [20 marks]
Q5. BFS vs DFS. [20 marks]
"""

class TestPaperAnalyzer:
    def setup_method(self):
        from agents.paper_analyzer import PaperAnalyzerAgent
        self.agent = PaperAnalyzerAgent()

    def test_instantiation(self):
        assert hasattr(self.agent, "analyse")
        assert hasattr(self.agent, "extract_pdf")
        assert hasattr(self.agent, "extract_image")

    def test_analyse_returns_dict(self):
        r = self.agent.analyse(SAMPLE_PAPER)
        assert isinstance(r, dict)

    def test_analyse_has_required_keys(self):
        r = self.agent.analyse(SAMPLE_PAPER)
        for k in ["subject","total_marks","topics","questions"]:
            assert k in r, f"Key '{k}' missing"

    def test_analyse_fallback_on_empty(self):
        r = self.agent.analyse("")
        assert "subject" in r


# ── Grading Agent tests ───────────────────────────────────

class TestGradingAgent:
    def setup_method(self):
        from agents.grading_agent import GradingAgent
        self.agent = GradingAgent()

    def test_letter_grade_boundaries(self):
        cases = [(95,"A+"),(85,"A"),(75,"B"),(65,"C"),(55,"D"),(40,"F")]
        for pct, expected in cases:
            letter, _ = self.agent.letter_grade(pct)
            assert letter == expected, f"pct={pct}: expected {expected}, got {letter}"

    def test_report_contains_required_sections(self):
        results = {
            "Q1": {"marks_awarded":8,"marks_total":10,"percentage":80,
                   "grade":"Good","feedback":"Good work.","topic":"Trees",
                   "correct_points":["Correct def"],"missing_points":["Complexity"]},
        }
        mock   = {"subject":"DSA","total_marks":10}
        report = self.agent.build_report(results, mock, 8, 10, 80.0)
        assert "GRADE REPORT" in report
        assert "Q1" in report
        assert "FINAL GRADE" in report

    def test_grade_one_returns_valid_structure(self):
        r = self.agent.grade_one(
            "Q1",
            "A binary search tree is a tree where left child < parent < right child.",
            "BST: ordered binary tree, left < parent, right > parent. O(log n) search.",
            10, "Trees"
        )
        assert isinstance(r, dict)
        assert "marks_awarded" in r
        assert 0 <= r["marks_awarded"] <= 10
        assert "marks_total" in r
        assert "percentage" in r
        assert "feedback" in r


# ── Mock Generator tests ──────────────────────────────────

class TestMockGenerator:
    def setup_method(self):
        from agents.mock_generator import MockGeneratorAgent
        self.agent = MockGeneratorAgent()

    def test_instantiation(self):
        assert hasattr(self.agent, "generate")
        assert hasattr(self.agent, "export_pdf")

    def test_generate_fallback_when_no_llm(self):
        """Should return placeholder questions if LLM unavailable."""
        analysis = {
            "subject": "CS", "total_marks": 60,
            "topics": ["Trees","Graphs"],
            "questions": [],
            "difficulty_distribution": {"easy":33,"medium":34,"hard":33},
            "type_distribution": {"theory":100},
        }
        qs = self.agent.generate(analysis)
        assert isinstance(qs, list)
        assert len(qs) >= 6


# ── Evaluation Metrics tests ──────────────────────────────

class TestEvaluationMetrics:
    def test_grading_metrics(self):
        from evaluation.metrics import compute_grading_metrics
        gr = {
            "Q1": {"marks_awarded":8,"marks_total":10},
            "Q2": {"marks_awarded":12,"marks_total":20},
            "Q3": {"marks_awarded":0,"marks_total":10},
        }
        m = compute_grading_metrics(gr)
        assert "accuracy"  in m
        assert "precision" in m
        assert "recall"    in m
        assert "f1_score"  in m
        assert 0 <= m["accuracy"] <= 100

    def test_learning_metrics(self):
        from evaluation.metrics import compute_learning_metrics
        ms = {"Topic A": 0.8, "Topic B": 0.7, "Topic C": 0.9}
        m  = compute_learning_metrics(ms)
        assert "accuracy" in m
        assert 70 <= m["accuracy"] <= 100

    def test_empty_grading_returns_empty(self):
        from evaluation.metrics import compute_grading_metrics
        assert compute_grading_metrics({}) == {}


# ── Learning Agent tests ──────────────────────────────────

class TestLearningAgent:
    def setup_method(self):
        from agents.learning_agent import LearningAgent
        self.agent = LearningAgent()

    def test_plan_dsa(self):
        path = self.agent.plan("Learn Data Structures and Algorithms")
        assert len(path) >= 1
        assert isinstance(path[0], str)

    def test_plan_database(self):
        path = self.agent.plan("Study databases and SQL")
        assert len(path) >= 1

    def test_plan_ml(self):
        path = self.agent.plan("Master machine learning")
        assert any("Learning" in t or "Neural" in t or "ML" in t for t in path)

    def test_plan_returns_known_topics(self):
        from agents.learning_agent import KNOWLEDGE_GRAPH
        all_topics = {t for ts in KNOWLEDGE_GRAPH.values() for t in ts}
        path = self.agent.plan("Learn operating systems")
        for topic in path:
            assert topic in all_topics, f"Unknown topic: {topic}"


# ── FastAPI endpoint tests (no LLM required) ──────────────

@pytest.mark.asyncio
async def test_health_endpoint():
    from httpx import AsyncClient, ASGITransport
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    assert "dataset" in data


@pytest.mark.asyncio
async def test_root_endpoint():
    from httpx import AsyncClient, ASGITransport
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "EduAgent AI API"


@pytest.mark.asyncio
async def test_baseline_endpoint():
    from httpx import AsyncClient, ASGITransport
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/api/evaluate/baseline")
    assert r.status_code == 200
    data = r.json()
    assert "system_accuracy" in data
    assert "baseline_accuracy" in data


@pytest.mark.asyncio
async def test_stats_endpoint():
    from httpx import AsyncClient, ASGITransport
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/api/stats")
    assert r.status_code == 200
    data = r.json()
    assert "dataset" in data
