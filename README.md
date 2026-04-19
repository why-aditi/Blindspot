# Blindspot

> **"Your model has a blindspot."**

Blindspot is an AI bias detection and fairness platform for ML developers. It helps you detect, explain, and correct bias before your model reaches real people — with a developer-first API, an interactive web interface, and an India-first NLP scanner.

Built for **Google Solution Challenge 2026** · Aligned with **SDG 10 — Reduced Inequalities** · MIT Licensed

---

## Features

| Module | Status | Description |
|---|---|---|
| **Dataset Audit** | ✅ Live | Scan any CSV/JSON for representation gaps, proxy variables, and label skew |
| **FairScore API** | ✅ Live | One POST call returns a 0–100 fairness rating with metric breakdown |
| **SHAP Explainer** | 🔜 Soon | Feature-by-feature attribution for individual predictions |
| **Counterfactuals** | 🔜 Soon | Actionable paths from rejected to approved |
| **NLP Scanner** | 🔜 Soon | Detect gendered language, age bias, and caste signals in job descriptions |
| **Drift Monitor** | 🔜 Soon | Catch fairness degradation in production models |

---

## Tech Stack

### Backend
- **FastAPI** + Uvicorn
- **Pandas / NumPy / SciPy** — data processing and distance calculations
- **Pydantic** — request validation
- **Supabase** — database (wired, not yet used)

### Frontend
- **React 18 + Vite + TypeScript**
- **Tailwind CSS** — utility styling with custom Blindspot design tokens
- **Framer Motion** — scroll animations, entrance effects, layout transitions
- **@react-three/fiber + drei** — 3D bias node graph in the hero
- **lenis** — smooth scroll
- **Sonner** — toast notifications
- **Lucide React** — icons

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r req.txt
uvicorn main:app --reload
```

Runs at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`.

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/dashboard` | Project overview and quick actions |
| `/audit` | Dataset bias audit |
| `/score` | Model fairness scoring |

---

## Project Structure

```
blindspot/
├── backend/
│   ├── main.py              # FastAPI app, CORS config, deployment-ready server
│   ├── req.txt              # Python dependencies
│   ├── routers/             # HTTP routes layer
│   │   ├── audit.py         # POST /audit
│   │   └── score.py         # POST /score
│   ├── controllers/         # Request orchestration layer
│   │   ├── audit_controller.py
│   │   └── score_controller.py
│   ├── services/            # Business logic layer
│   │   ├── audit_service.py
│   │   └── score_service.py
│   ├── modules/             # Core fairness algorithms
│   │   ├── audit/
│   │   │   ├── auditor.py   # BiasAuditor — distribution, proxy, label skew
│   │   │   └── utils.py
│   │   └── score/
│   │       ├── scorer.py    # FairScorer — weighted fairness score (DP:30%, EO:50%, IF:20%)
│   │       └── metrics.py   # Statistical/predictive parity calculations
│   └── db/
│       └── supabase_client.py
└── frontend/
    ├── index.html
    ├── tailwind.config.js   # Blindspot design tokens (accent, danger, clear colors)
    └── src/
        ├── App.tsx           # Router — / for landing, /* for app
        ├── main.tsx          # Lenis smooth scroll init
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── Audit.tsx
        │   └── FairScore.tsx
        └── components/
            ├── Navigation.tsx
            ├── LoadingSpinner.tsx
            ├── ErrorAlert.tsx
            └── landing/          # Marketing landing page
                ├── LandingPage.tsx
                ├── Navbar.tsx
                ├── Hero.tsx           # 3D node graph (R3F)
                ├── Ticker.tsx
                ├── ProblemSection.tsx
                ├── HowItWorks.tsx
                ├── FeaturesGrid.tsx
                ├── FairScoreDemo.tsx  # Interactive demo
                ├── NLPScanner.tsx
                ├── CredibilityStrip.tsx
                ├── FinalCTA.tsx
                └── Footer.tsx
```

---