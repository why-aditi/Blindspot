from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.correct_service import CorrectService


class CorrectionRequest(BaseModel):
    strategy: str
    X_test: List[List[float]]
    y_true: List[int]
    y_pred: List[int]
    sensitive_features: List[int]
    X_train: Optional[List[List[float]]] = None
    y_train: Optional[List[int]] = None
    sensitive_train: Optional[List[int]] = None


class CorrectController:
    def __init__(self):
        self.correct_service = CorrectService()

    async def handle_correction(self, request: CorrectionRequest):
        try:
            if request.strategy not in ("pre", "in", "post"):
                raise HTTPException(status_code=400, detail="strategy must be 'pre', 'in', or 'post'")
            if len(request.y_true) != len(request.y_pred) or len(request.y_true) != len(request.sensitive_features):
                raise HTTPException(status_code=400, detail="y_true, y_pred, and sensitive_features must have the same length")
            if len(request.X_test) != len(request.y_true):
                raise HTTPException(status_code=400, detail="X_test and y_true must have the same number of samples")

            result = self.correct_service.run_correction(
                request.strategy,
                request.X_test, request.y_true, request.y_pred, request.sensitive_features,
                request.X_train, request.y_train, request.sensitive_train,
            )
            return result

        except HTTPException:
            raise
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Correction failed: {str(e)}")
