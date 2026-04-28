import io
import os
import shutil
import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

SAMPLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "samples")

# Bump whenever sample data or model changes — triggers regeneration on next /samples/ hit.
_VERSION = "3"

# 80-row dataset with three distinct tiers so the Random Forest learns strong,
# varied feature weights — giving non-trivial SHAP values for the sample instance
# {age:35, employment_type:0, credit_score:580, region:1}.
#
# Tier A (rows 1-40):  credit_score 660-780  → almost always approved  (38/40)
# Tier B (rows 41-60): credit_score 610-659  → employment_type decides (15/20 employed→approved)
# Tier C (rows 61-80): credit_score 480-609  → almost always rejected  (1/20 approved)
#
# Expected SHAP for sample instance (denied, low score, unemployed):
#   credit_score   : strong negative
#   employment_type: moderate negative
#   age            : slight positive
#   region         : near zero
_TRAIN_CSV = """\
age,employment_type,credit_score,region,approved
22,0,680,1,1
25,1,720,0,1
30,0,760,1,1
35,1,680,1,1
40,1,700,0,1
45,0,740,1,1
50,1,780,1,1
55,1,660,0,1
28,0,690,0,1
33,1,750,1,1
38,0,720,0,1
43,1,770,1,1
48,1,680,0,1
23,0,700,1,1
27,1,740,0,1
31,0,760,1,1
36,1,690,1,1
41,0,720,0,1
46,1,750,1,1
51,1,770,0,1
26,0,680,1,1
29,1,700,0,1
34,0,740,1,1
39,1,760,0,1
44,1,780,1,1
49,0,690,1,1
24,1,720,0,1
32,0,750,1,1
37,1,760,1,1
42,1,700,0,1
47,0,680,1,0
52,1,740,0,1
21,0,760,1,1
28,1,720,0,1
35,0,700,1,0
42,1,780,0,1
49,0,660,1,1
56,1,690,0,1
31,0,750,1,1
38,1,770,0,1
22,1,640,0,1
28,0,630,1,0
35,1,650,1,1
41,0,620,0,0
47,1,635,1,1
33,0,645,0,0
29,1,655,1,1
52,0,625,0,0
25,1,640,0,1
44,0,615,1,0
37,1,650,0,1
31,0,635,1,0
48,1,645,0,1
26,0,620,1,0
39,1,655,1,1
55,0,630,0,0
43,1,640,1,1
34,0,625,0,0
27,1,650,0,1
46,0,635,1,0
22,0,580,1,0
25,1,600,0,0
30,0,520,1,0
35,1,590,1,0
40,1,560,0,0
45,0,540,1,0
50,1,580,0,0
55,0,510,1,0
28,1,595,0,0
33,0,550,1,0
38,1,570,0,0
43,0,530,1,0
48,1,590,0,1
23,0,500,0,0
27,1,580,1,0
31,0,545,0,0
36,1,560,1,0
41,0,510,0,0
46,1,595,1,0
51,0,570,0,0
"""

_ALLOWED = {"sample_model.pkl", "sample_train.csv"}


def _ensure_samples():
    os.makedirs(SAMPLES_DIR, exist_ok=True)
    version_path = os.path.join(SAMPLES_DIR, ".version")

    if os.path.exists(version_path):
        with open(version_path) as f:
            if f.read().strip() != _VERSION:
                shutil.rmtree(SAMPLES_DIR)
                os.makedirs(SAMPLES_DIR)

    csv_path = os.path.join(SAMPLES_DIR, "sample_train.csv")
    model_path = os.path.join(SAMPLES_DIR, "sample_model.pkl")

    if not os.path.exists(csv_path):
        with open(csv_path, "w") as f:
            f.write(_TRAIN_CSV)

    if not os.path.exists(model_path):
        from sklearn.ensemble import RandomForestClassifier
        df = pd.read_csv(io.StringIO(_TRAIN_CSV))
        X = df[["age", "employment_type", "credit_score", "region"]].values
        y = df["approved"].values
        # deeper trees + more estimators → stronger signal → larger SHAP magnitudes
        model = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42)
        model.fit(X, y)
        joblib.dump(model, model_path)

    if not os.path.exists(version_path):
        with open(version_path, "w") as f:
            f.write(_VERSION)


@router.get("/samples/{filename}")
async def get_sample(filename: str):
    if filename not in _ALLOWED:
        raise HTTPException(status_code=404, detail="Sample not found")
    _ensure_samples()
    return FileResponse(os.path.join(SAMPLES_DIR, filename), filename=filename)
