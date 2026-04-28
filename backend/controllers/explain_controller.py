from fastapi import UploadFile, Form, HTTPException
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.explain_service import ExplainService


class ExplainController:
    def __init__(self):
        self.explain_service = ExplainService()

    async def handle_explain(
        self,
        model_file: UploadFile,
        X_train_file: UploadFile,
        X_instance: str,
        feature_cols: str,
        outcome_col: str,
        continuous_features: str,
    ):
        try:
            model_bytes = await model_file.read()
            X_train_bytes = await X_train_file.read()
            cols = [c.strip() for c in feature_cols.split(",") if c.strip()]
            cont_cols = [c.strip() for c in continuous_features.split(",") if c.strip()]

            if not cols:
                raise HTTPException(status_code=400, detail="feature_cols cannot be empty")
            if not outcome_col.strip():
                raise HTTPException(status_code=400, detail="outcome_col cannot be empty")

            result = self.explain_service.run_explain(
                model_bytes, X_train_bytes, X_instance.strip(),
                cols, outcome_col.strip(), cont_cols,
            )
            return {"status": "ok", "explanation": result}

        except HTTPException:
            raise
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")
