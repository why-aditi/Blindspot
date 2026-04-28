from fastapi import APIRouter
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from controllers.correct_controller import CorrectController, CorrectionRequest

router = APIRouter(prefix="/correct", tags=["correct"])
correct_controller = CorrectController()


@router.post("/")
async def correct_bias(request: CorrectionRequest):
    """
    Apply bias correction using one of three strategies:
    - post: threshold adjustment per group (no retraining needed)
    - pre: reweighing sample weights for training (AIF360 formula)
    - in: constrained retraining with Fairlearn ExponentiatedGradient

    Returns before/after fairness scores and accuracy tradeoff.
    """
    return await correct_controller.handle_correction(request)
