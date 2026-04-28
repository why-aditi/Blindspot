from fastapi import APIRouter, UploadFile, File, Form
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from controllers.explain_controller import ExplainController

router = APIRouter(prefix="/explain", tags=["explain"])
explain_controller = ExplainController()


@router.post("/")
async def explain_decision(
    model_file: UploadFile = File(...),
    X_train_file: UploadFile = File(...),
    X_instance: str = Form(...),
    feature_cols: str = Form(...),
    outcome_col: str = Form(...),
    continuous_features: str = Form(""),
):
    """
    Explain an AI decision with SHAP feature attribution, DiCE counterfactuals,
    and a plain-English summary via Groq/Llama.

    Args:
        model_file: Serialized sklearn model (.pkl / .joblib)
        X_train_file: Training data CSV (must include outcome_col)
        X_instance: JSON string of the single instance to explain
        feature_cols: Comma-separated feature column names
        outcome_col: Target/outcome column name in training data
        continuous_features: Comma-separated continuous feature names (for DiCE)
    """
    return await explain_controller.handle_explain(
        model_file, X_train_file, X_instance, feature_cols, outcome_col, continuous_features
    )
