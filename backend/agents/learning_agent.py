"""
backend/agents/learning_agent.py — adaptive learning pipeline
"""
import numpy as np
from core.llm import llm
from core.dataset import dataset

KNOWLEDGE_GRAPH = {
    "Data Structures":         ["Arrays and Strings","Linked Lists","Stacks and Queues","Trees and BST","Graphs","Hash Tables"],
    "Algorithms":              ["Algorithm Analysis (Big-O)","Sorting Algorithms","Dynamic Programming","Graph Algorithms","Greedy Algorithms"],
    "Databases":               ["SQL Basics","Database Design and ER Model","Normalisation","Transaction Management","NoSQL Databases"],
    "Operating Systems":       ["Process Management","CPU Scheduling","Memory Management","File Systems","Synchronisation and Deadlocks"],
    "Computer Networks":       ["OSI and TCP/IP Model","Network Layer and IP","Transport Layer","Network Security"],
    "Machine Learning":        ["Supervised Learning","Unsupervised Learning","Neural Networks","Deep Learning"],
    "Web Development":         ["HTML and CSS","JavaScript","Frontend Frameworks","Backend Development","REST APIs"],
    "Programming":             ["Variables and Data Types","Control Flow","Functions and Recursion","Object-Oriented Programming"],
    "Software Engineering":    ["Design Patterns","Software Testing","Agile and DevOps"],
}

DOMAIN_MAP = {
    ("data struct","dsa","tree","linked","stack","queue","heap","hash"): "Data Structures",
    ("algorithm","sort","dynamic","greedy","big-o","complexity"):        "Algorithms",
    ("database","sql","dbms","normalisation","relation"):                "Databases",
    ("operating system","os ","process","scheduling","memory"):          "Operating Systems",
    ("network","tcp","ip","protocol","osi","http"):                      "Computer Networks",
    ("machine learning","ml","neural","deep learning","supervised"):     "Machine Learning",
    ("web","html","css","javascript","react","frontend","backend"):      "Web Development",
    ("programming","python","java","c++","oop","function"):              "Programming",
    ("software","design pattern","testing","agile","devops"):            "Software Engineering",
}


class LearningAgent:

    def plan(self, goal: str) -> list[str]:
        gl = goal.lower()
        for keywords, domain in DOMAIN_MAP.items():
            if any(k in gl for k in keywords):
                return KNOWLEDGE_GRAPH.get(domain, ["Programming Fundamentals"])[:4]
        # LLM fallback
        all_topics = [t for ts in KNOWLEDGE_GRAPH.values() for t in ts]
        r = llm.ask_json(
            f'Pick 4 topics from this list for goal: "{goal}"\n'
            f'Topics: {all_topics[:30]}\n'
            'Return JSON array of 4 exact topic names.'
        )
        if isinstance(r, list) and r:
            valid = [t for t in r if any(t in ts for ts in KNOWLEDGE_GRAPH.values())]
            if valid:
                return valid[:4]
        return ["Programming Fundamentals", "Data Structures", "Algorithms", "Databases"]

    def generate_content(self, topic: str) -> str:
        prompt = f"""Write educational content for a B.Tech Computer Science student.

Topic: {topic}

Sections:
## Introduction
Why this topic matters + 2 real-world applications.

## Core Concepts
3-4 paragraphs: precise definitions, how it works, time/space complexity where relevant.

## Examples
2-3 concrete worked examples with pseudocode or Python where helpful.

## Key Takeaways
7 bullet points: definitions, complexity, pitfalls, interview tips.

Be rigorous, precise, exam-focused."""
        return llm.ask(prompt, cache=True)

    def generate_questions(self, topic: str) -> list:
        prompt = f"""Create 4 exam-quality questions on: {topic}
One at each level: easy (definition), medium (application), hard (analysis), advanced (design).
Return ONLY JSON array:
[{{"question":"...","difficulty":"easy|medium|hard|advanced","correct_answer":"...","marks":10}}]"""
        qs = llm.ask_json(prompt, cache=True)
        if not isinstance(qs, list) or not qs:
            qs = [
                {"question": f"Define and explain {topic}.",
                 "difficulty": "easy", "correct_answer": "See course notes.", "marks": 10},
                {"question": f"Apply {topic} to solve a real problem.",
                 "difficulty": "medium", "correct_answer": "Application example.", "marks": 10},
            ]
        return qs

    def compute_mastery_and_feedback(self, topic: str) -> tuple[float, str]:
        engagement = float(np.random.uniform(45, 85))
        mastery    = dataset.compute_mastery(engagement)
        summary    = dataset.summary()
        prompt = f"""Personalised study feedback.
Topic: {topic} | Mastery: {mastery:.1%} | Dataset avg: {summary['avg_performance']:.1%}
Write 3 paragraphs: (1) what was achieved (2) one area to strengthen (3) next step + encouragement."""
        feedback = llm.ask(prompt, cache=False)
        return mastery, feedback

    def run(self, goal: str) -> dict:
        path    = self.plan(goal)
        topics  = []
        mastery = {}

        for topic in path:
            content   = self.generate_content(topic)
            questions = self.generate_questions(topic)
            m, fb     = self.compute_mastery_and_feedback(topic)
            mastery[topic] = m
            topics.append({
                "topic":     topic,
                "mastery":   m,
                "content":   content,
                "questions": questions,
                "feedback":  fb,
            })

        avg = float(np.mean(list(mastery.values()))) if mastery else 0.0

        # Overall feedback
        overall_fb = llm.ask(
            f'Wrap up a learning session. Goal: "{goal}". '
            f'Topics: {path}. Avg mastery: {avg:.1%}. '
            'Write 2 encouraging sentences and suggest what to study next.',
            cache=False
        )

        return {
            "learning_path":  path,
            "topics_covered": topics,
            "avg_mastery":    round(avg, 3),
            "feedback_text":  overall_fb,
        }


learning_agent = LearningAgent()
