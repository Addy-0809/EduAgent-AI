"""
backend/core/dataset.py — xAPI-Edu-Data analyser (480 real student records)
"""
import numpy as np
import pandas as pd
from core.config import settings


class DatasetAnalyzer:
    def __init__(self):
        self.df = self._load()
        self.n  = len(self.df)
        self._prepare()
        print(f"✅ Dataset → {self.n} student records")

    def _load(self) -> pd.DataFrame:
        paths = [
            settings.DATASET_PATH,
            "/kaggle/input/xapi-edu-data/xAPI-Edu-Data.csv",
            "/content/xAPI-Edu-Data.csv",
        ]
        for p in paths:
            try:
                return pd.read_csv(p)
            except FileNotFoundError:
                continue
        print("⚠️  Using synthetic dataset")
        rng = np.random.default_rng(42)
        return pd.DataFrame({
            "Topic":              ["IT","Math","Science","English"] * 120,
            "raisedhands":        rng.integers(10, 90, 480),
            "VisITedResources":   rng.integers(10, 90, 480),
            "Discussion":         rng.integers(10, 90, 480),
            "Class":              rng.choice(["L","M","H"], 480, p=[.25,.50,.25]),
            "StudentAbsenceDays": rng.choice(["Under-7","Above-7"], 480),
        })

    def _prepare(self):
        self.df["engagement"] = (
            self.df["raisedhands"] + self.df["VisITedResources"] + self.df["Discussion"]
        ) / 3
        self.df["perf"] = self.df["Class"].map({"L":0.40,"M":0.70,"H":0.95})

    def baseline_accuracy(self) -> float:
        return round(float(self.df["perf"].mean()) * 100, 2)

    def compute_mastery(self, engagement: float) -> float:
        avg_eng  = float(self.df["engagement"].mean())
        avg_perf = float(self.df["perf"].mean())
        ratio    = engagement / avg_eng if avg_eng > 0 else 1.0
        return round(min(0.98, avg_perf * (0.80 + 0.20 * ratio)), 3)

    def summary(self) -> dict:
        return {
            "total_records":       self.n,
            "avg_engagement":      round(float(self.df["engagement"].mean()), 2),
            "avg_performance":     round(float(self.df["perf"].mean()), 3),
            "high_performers_pct": round(float((self.df["Class"]=="H").mean()*100), 1),
            "low_performers_pct":  round(float((self.df["Class"]=="L").mean()*100), 1),
            "baseline_accuracy":   self.baseline_accuracy(),
        }


dataset = DatasetAnalyzer()
