from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import sys
import os

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.score_service import ScoreService


class ScoreRequest(BaseModel):
    X_test: List[List[float]]
    y_true: List[int]
    y_pred: List[int]
    sensitive_features: List[int]


class ScoreController:
    def __init__(self):
        self.score_service = ScoreService()
    
    async def handle_score(self, request: ScoreRequest):
        """
        Handle score request - controller layer that orchestrates the service call
        
        Args:
            request: Score request with model data
            
        Returns:
            Fairness score results
        """
        try:
            # Validate inputs
            if len(request.y_true) != len(request.y_pred) or len(request.y_true) != len(request.sensitive_features):
                raise HTTPException(
                    status_code=400,
                    detail="y_true, y_pred, and sensitive_features must have the same length"
                )
            
            if len(request.X_test) != len(request.y_true):
                raise HTTPException(
                    status_code=400,
                    detail="X_test and y_true must have the same number of samples"
                )
            
            # Call service layer
            result = self.score_service.calculate_fair_score(
                request.X_test,
                request.y_true,
                request.y_pred,
                request.sensitive_features
            )
            
            if 'error' in result:
                raise HTTPException(status_code=500, detail=result['error'])
            
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")
