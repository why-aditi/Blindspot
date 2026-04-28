import io
import json
import joblib
import numpy as np
import pandas as pd
from typing import List

from modules.explain.groq_client import call_groq


class Explainer:
    def explain(
        self,
        model_bytes: bytes,
        X_train_bytes: bytes,
        X_instance_json: str,
        feature_cols: List[str],
        outcome_col: str,
        continuous_features: List[str],
    ) -> dict:
        model = joblib.load(io.BytesIO(model_bytes))
        X_train_df = pd.read_csv(io.BytesIO(X_train_bytes))
        X_instance_dict = json.loads(X_instance_json)
        X_instance_df = pd.DataFrame([X_instance_dict])[feature_cols]
        X_instance_arr = X_instance_df.values

        X_train_arr = X_train_df[feature_cols].values
        top_reasons = self._shap_explain(model, X_instance_arr, X_train_arr, feature_cols)
        counterfactuals = self._dice_counterfactuals(
            model, X_train_df, X_instance_df, feature_cols, outcome_col, continuous_features
        )
        plain_english = self._llm_explain(top_reasons)

        return {
            "top_reasons": top_reasons,
            "counterfactuals": counterfactuals,
            "plain_english": plain_english,
        }

    def _shap_explain(
        self, model, X_instance_arr: np.ndarray, X_train_arr: np.ndarray, feature_cols: List[str]
    ) -> list:
        try:
            import shap
            # Pass training data as background so interventional SHAP works correctly.
            explainer = shap.TreeExplainer(model, data=X_train_arr, feature_perturbation="interventional")
            raw_output = explainer.shap_values(X_instance_arr, check_additivity=False)

            # Normalise across shap version output formats:
            #   < 0.40 : list[neg_arr, pos_arr]  shape each (n, features)
            #   0.40+  : ndarray (n, features, classes) or (classes, n, features)
            #   any    : Explanation object with .values attr
            if isinstance(raw_output, list):
                vals = np.array(raw_output[1][0] if len(raw_output) > 1 else raw_output[0][0])
            elif hasattr(raw_output, "values"):
                v = np.array(raw_output.values[0])
                vals = v[:, 1] if v.ndim == 2 else v
            else:
                arr = np.array(raw_output)
                if arr.ndim == 3:
                    # Could be (n_samples, n_features, n_classes) or (n_classes, n_samples, n_features)
                    if arr.shape[0] == X_instance_arr.shape[0]:
                        vals = arr[0, :, 1]
                    else:
                        vals = arr[1, 0, :]
                elif arr.ndim == 2:
                    vals = arr[0]
                else:
                    vals = arr

            return sorted(
                [{"feature": f, "impact": round(float(v), 3)} for f, v in zip(feature_cols, vals)],
                key=lambda x: abs(x["impact"]),
                reverse=True,
            )[:5]
        except Exception:
            return [{"feature": f, "impact": 0.0} for f in feature_cols[:5]]

    def _dice_counterfactuals(
        self, model, X_train_df: pd.DataFrame, X_instance_df: pd.DataFrame,
        feature_cols: List[str], outcome_col: str, continuous_features: List[str]
    ) -> list:
        try:
            import dice_ml
            if outcome_col not in X_train_df.columns:
                return []
            cont_cols = continuous_features if continuous_features else feature_cols
            d = dice_ml.Data(
                dataframe=X_train_df,
                continuous_features=cont_cols,
                outcome_name=outcome_col,
            )
            m = dice_ml.Model(model=model, backend="sklearn")
            exp = dice_ml.Dice(d, m, method="random")
            cfs = exp.generate_counterfactuals(X_instance_df, total_CFs=3, desired_class="opposite")
            return cfs.cf_examples_list[0].final_cfs_df.to_dict("records")
        except Exception:
            return []

    def _llm_explain(self, features: list) -> str:
        prompt = (
            f"Explain this AI decision in 2 plain sentences for a non-technical person. "
            f"The top factors (positive impact = helped the decision, negative = hurt it) are: {features}."
        )
        return call_groq(prompt)
