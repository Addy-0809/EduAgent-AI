# Contributing to EduAgent AI

Thanks for taking the time to contribute! 🎓

---

## Development Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then add your GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                      # → http://localhost:3000
```

---

## Running Tests

```bash
# Backend
cd backend
pytest tests/ -v --tb=short

# Frontend (lint only for now)
cd frontend
npm run lint
```

---

## Branching Strategy

| Branch    | Purpose                     |
|-----------|-----------------------------|
| `main`    | Production — auto-deploys   |
| `develop` | Integration branch          |
| `feat/*`  | New features                |
| `fix/*`   | Bug fixes                   |
| `docs/*`  | Documentation only          |

---

## Pull Request Checklist

Before submitting a PR:

- [ ] Backend tests pass: `pytest tests/ -v`
- [ ] No ruff lint errors: `ruff check .`
- [ ] Frontend builds: `npm run build`
- [ ] Updated docstrings / comments for changed code
- [ ] Added or updated tests for new functionality
- [ ] PR description explains *what* and *why*

---

## Agent Architecture

If you're adding a new agent:

1. Create `backend/agents/your_agent.py`
2. Add corresponding endpoint in `backend/main.py`
3. Add tests in `backend/tests/test_your_agent.py`
4. Wire up the frontend API call in `frontend/src/lib/api.js`
5. Add a new page or extend existing one in `frontend/src/pages/`

---

## Code Style

- Python: follow PEP 8, use type hints
- React: functional components + hooks, no class components
- CSS: use CSS custom properties (var(--token)) from `index.css`

---

## Questions?

Open a GitHub Discussion or file an issue with the `question` label.
