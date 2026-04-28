from typing import List
from modules.explain.explainer import Explainer

_explainer = Explainer()


class ExplainService:
    def run_explain(
        self,
        model_bytes: bytes,
        X_train_bytes: bytes,
        X_instance_json: str,
        feature_cols: List[str],
        outcome_col: str,
        continuous_features: List[str],
    ) -> dict:
        return _explainer.explain(
            model_bytes, X_train_bytes, X_instance_json,
            feature_cols, outcome_col, continuous_features,
        )
