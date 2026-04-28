# Blindspot

> **"Your model has a blindspot."**

Blindspot is an AI bias detection and fairness platform for ML developers. It helps you detect, explain, and correct bias before your model reaches real people — with a developer-first API, an interactive web interface, and an India-first NLP scanner.

Built for **Google Solution Challenge 2026** · Aligned with **SDG 10 — Reduced Inequalities** · MIT Licensed

---

## Features

| Module | Status | Description |
|---|---|---|
| **Dataset Audit** | ✅ Live | Scan any CSV/JSON for representation gaps, proxy variables, and label skew |
| **FairScore API** | ✅ Live | One POST call returns a 0–100 fairness rating with DP, EO, and IF breakdown |
| **XAI Explainer** | ✅ Live | SHAP feature attribution + DiCE counterfactuals + plain-English summary via Groq |
| **Bias Correction** | ✅ Live | Three correction strategies (pre/in/post-processing) with before/after tradeoff |
| **NLP Scanner** | ✅ Live | Detect gendered language, age bias, caste signals, and socioeconomic markers in text |
| **Drift Monitor** | ✅ Live | Evidently AI drift reports comparing reference vs live predictions, with Supabase alerts |

---

## Tech Stack

### Backend
- **FastAPI** + Uvicorn
- **Pandas / NumPy / SciPy** — data processing and fairness metric calculations
- **scikit-learn + joblib** — model loading and in-process correction base estimator
- **SHAP** — feature attribution via TreeExplainer
- **DiCE** — counterfactual explanation generation
- **Fairlearn** — ExponentiatedGradient for in-processing bias correction
- **spaCy** — NLP tokenization for bias word scanning
- **Transformers** — BERT-based bias classification (`d4data/bias-detection-model`)
- **Evidently AI** — data drift and classification reports
- **Groq SDK** — Llama 3 inference for plain-English explanations and neutral rewrites
- **Supabase** — database for drift alerts and fairness history

### Frontend
- **React 18 + Vite + TypeScript**
- **Tailwind CSS** — utility styling with custom Blindspot design tokens
- **Framer Motion** — scroll animations, entrance effects, layout transitions
- **@react-three/fiber + drei** — 3D bias node graph in the hero
- **Recharts** — fairness metric visualisation
- **lenis** — smooth scroll
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

# Download the spaCy model (required for NLP Scanner)
python -m spacy download en_core_web_sm

# Copy and fill in environment variables
cp .env.example .env
```

**.env variables:**

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | For Monitor alerts | Your Supabase project URL |
| `SUPABASE_KEY` | For Monitor alerts | Your Supabase anon key |
| `GROQ_API_KEY` | Recommended | Free at console.groq.com — enables plain-English explanations and NLP rewrites. Falls back to a template string if absent. |

```bash
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

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/audit` | Audit a CSV/JSON dataset for bias |
| `POST` | `/score` | Calculate FairScore for a model |
| `POST` | `/explain` | SHAP + DiCE + Groq explanation for one prediction |
| `POST` | `/correct` | Apply pre/in/post-processing bias correction |
| `POST` | `/nlp-scan` | Scan text for biased language |
| `POST` | `/monitor` | Generate Evidently drift report comparing two CSVs |
| `GET` | `/health` | Health check |

### `POST /explain` — multipart form
| Field | Type | Description |
|---|---|---|
| `model_file` | file | Serialized sklearn model (`.pkl` / `.joblib`) |
| `X_train_file` | file | Training data CSV — must include `outcome_col` |
| `X_instance` | string | JSON dict of the single instance to explain |
| `feature_cols` | string | Comma-separated feature column names |
| `outcome_col` | string | Target/label column name in the training CSV |
| `continuous_features` | string | Comma-separated continuous feature names (for DiCE) |

### `POST /correct` — JSON body
```json
{
  "strategy": "post",
  "X_test": [[1.0, 2.0], ...],
  "y_true": [1, 0, ...],
  "y_pred": [1, 0, ...],
  "sensitive_features": [0, 1, ...],
  "X_train": [[...], ...],
  "y_train": [1, 0, ...],
  "sensitive_train": [0, 1, ...]
}
```

`X_train`, `y_train`, `sensitive_train` are required only for the `"in"` strategy. `y_train` and `sensitive_train` are required for `"pre"`.

### `POST /nlp-scan` — JSON body
```json
{ "text": "We are looking for a young and dynamic rockstar developer..." }
```

---

## Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/dashboard` | Project overview and quick actions |
| `/audit` | Dataset bias audit |
| `/score` | Model fairness scoring |
| `/explain` | XAI decision explanation |
| `/correct` | Bias correction with strategy selector |
| `/nlp-scan` | NLP bias scanner |
| `/monitor` | Fairness drift monitoring |

---

## Project Structure

```
blindspot/
├── backend/
│   ├── main.py              # FastAPI app — registers all 6 routers
│   ├── req.txt              # Python dependencies
│   ├── .env.example         # Environment variable template
│   ├── reports/             # Evidently HTML reports (auto-created)
│   ├── routers/             # HTTP routes layer
│   │   ├── audit.py         # POST /audit
│   │   ├── score.py         # POST /score
│   │   ├── explain.py       # POST /explain
│   │   ├── correct.py       # POST /correct
│   │   ├── nlp.py           # POST /nlp-scan
│   │   └── monitor.py       # POST /monitor
│   ├── controllers/         # Request orchestration layer
│   ├── services/            # Business logic layer
│   └── modules/             # Core algorithms
│       ├── audit/
│       │   ├── auditor.py   # BiasAuditor — distribution, proxy, label skew
│       │   └── utils.py
│       ├── score/
│       │   ├── scorer.py    # FairScorer — weighted score (DP:30%, EO:50%, IF:20%)
│       │   └── metrics.py
│       ├── explain/
│       │   ├── explainer.py # SHAP TreeExplainer + DiCE counterfactuals
│       │   └── groq_client.py
│       ├── correct/
│       │   └── corrector.py # BiasCorrector — post/pre/in strategies
│       ├── nlp/
│       │   └── scanner.py   # NLPScanner — rule-based + BERT + Groq rewrite
│       └── monitor/
│           └── monitor.py   # FairnessMonitor — Evidently + Supabase alerts
└── frontend/
    ├── tailwind.config.js   # Blindspot design tokens (accent, danger, clear)
    └── src/
        ├── App.tsx           # Router — / for landing, /* for app shell
        ├── api/
        │   └── client.ts    # Axios wrapper for all 6 endpoints
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── Audit.tsx
        │   ├── FairScore.tsx
        │   ├── Explain.tsx
        │   ├── Correct.tsx
        │   ├── NLPScanner.tsx
        │   └── Monitor.tsx
        └── components/
            ├── Navigation.tsx
            ├── LoadingSpinner.tsx
            ├── ErrorAlert.tsx
            └── landing/
```

---

## Deployment

| Service | What's deployed |
|---|---|
| **Render.com** | FastAPI backend — auto-deploys from `main` branch |
| **Vercel** | React frontend — auto-deploys from `main` branch |
| **Supabase** | Postgres DB for drift alerts and fairness history |
| **HuggingFace Hub** | `d4data/bias-detection-model` — loaded on first NLP scan request |

The NLP Scanner's BERT model is lazy-loaded on first request to avoid startup delays on Render's free tier.
