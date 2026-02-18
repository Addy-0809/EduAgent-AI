"""
backend/tests/conftest.py — shared pytest fixtures
"""
import sys, os, pytest

# Make backend root importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


@pytest.fixture
def sample_paper_text():
    return """
    DATA STRUCTURES EXAM
    Q1. Define BST. State its properties. [10 marks]
    Q2. Write QuickSort algorithm. [20 marks]
    Q3. Explain Dynamic Programming with Knapsack example. [30 marks]
    Q4. Dijkstra's shortest path algorithm. [20 marks]
    Q5. Compare BFS and DFS. [20 marks]
    Total: 100 marks  Time: 3 Hours
    """


@pytest.fixture
def sample_mock_paper():
    return {
        "subject":     "Data Structures & Algorithms",
        "total_marks": 60,
        "duration":    "3 Hours",
        "questions": [
            {
                "number": "Q1", "text": "Explain AVL tree rotations with example.",
                "marks": 15, "type": "theory", "difficulty": "medium",
                "topic": "Trees", "sub_parts": [],
                "model_answer": "AVL trees are self-balancing BSTs with height diff ≤ 1. Four rotation types: LL, RR, LR, RL."
            },
            {
                "number": "Q2", "text": "Implement merge sort and analyse complexity.",
                "marks": 20, "type": "coding", "difficulty": "hard",
                "topic": "Sorting", "sub_parts": [],
                "model_answer": "Merge sort: divide array into halves, sort each, merge. T=O(n log n), S=O(n)."
            },
            {
                "number": "Q3", "text": "Explain Dijkstra's algorithm with a worked example.",
                "marks": 25, "type": "theory", "difficulty": "hard",
                "topic": "Graph Algorithms", "sub_parts": [],
                "model_answer": "Greedy shortest path algorithm. Uses min-heap. O((V+E)logV)."
            },
        ]
    }


@pytest.fixture
def sample_grading_results():
    return {
        "Q1": {"marks_awarded": 12, "marks_total": 15, "percentage": 80,
               "grade": "Good", "feedback": "Good explanation.",
               "correct_points": ["Correct def", "Rotations correct"],
               "missing_points": ["Deletion case"], "topic": "Trees"},
        "Q2": {"marks_awarded": 14, "marks_total": 20, "percentage": 70,
               "grade": "Good", "feedback": "Merge sort mostly right.",
               "correct_points": ["Divide step correct"],
               "missing_points": ["Space complexity"], "topic": "Sorting"},
        "Q3": {"marks_awarded": 10, "marks_total": 25, "percentage": 40,
               "grade": "Needs Improvement", "feedback": "Algorithm partially correct.",
               "correct_points": ["Correct start"],
               "missing_points": ["Priority queue", "Relaxation"], "topic": "Graphs"},
    }
