from fastapi import APIRouter
import sys
import os

# Add parent directory to path to import controllers
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from controllers.score_controller import ScoreController, ScoreRequest

router = APIRouter(prefix="/score", tags=["score"])
score_controller = ScoreController()


@router.post("/")
async def score_model(request: ScoreRequest):
    """
    Calculate fairness score for a model.
    
    Args:
        X_test: Test feature matrix
        y_true: True labels
        y_pred: Predicted labels
        sensitive_features: Sensitive attribute values (e.g., 0/1 for binary)
        
    Returns:
        Fairness score with component breakdown
    """
    return await score_controller.handle_score(request)
