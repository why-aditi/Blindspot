import numpy as np
from typing import List, Optional, Dict, Any

from modules.correct.corrector import BiasCorrector
from modules.score.scorer import FairScorer

_corrector = BiasCorrector()
_scorer = FairScorer()


class CorrectService:
    def run_correction(
        self,
        strategy: str,
        X_test: List[List[float]],
        y_true: List[int],
        y_pred: List[int],
        sensitive_features: List[int],
        X_train: Optional[List[List[float]]] = None,
        y_train: Optional[List[int]] = None,
        sensitive_train: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        y_true_arr = np.array(y_true, dtype=int)
        y_pred_arr = np.array(y_pred, dtype=int)
        sf_arr = np.array(sensitive_features)

        before = _scorer.score(X_test, y_true, y_pred, sensitive_features)
        before_acc = round(float(np.mean(y_true_arr == y_pred_arr)), 3)

        corrected_preds = None
        sample_weights = None

        if strategy == "post":
            corrected = _corrector.post_process(y_pred_arr, y_true_arr, sf_arr)
            corrected_preds = corrected.tolist()
            after = _scorer.score(X_test, y_true, corrected_preds, sensitive_features)
            after_acc = round(float(np.mean(y_true_arr == corrected)), 3)

        elif strategy == "pre":
            if y_train is None or sensitive_train is None:
                raise ValueError("'pre' strategy requires y_train and sensitive_train")
            weights = _corrector.pre_process(
                np.array(y_train, dtype=int), np.array(sensitive_train)
            )
            sample_weights = [round(float(w), 4) for w in weights]
            after = before
            after_acc = before_acc

        elif strategy == "in":
            if X_train is None or y_train is None or sensitive_train is None:
                raise ValueError("'in' strategy requires X_train, y_train, and sensitive_train")
            corrected = _corrector.in_process(
                np.array(X_train, dtype=float),
                np.array(y_train, dtype=int),
                np.array(sensitive_train),
                np.array(X_test, dtype=float),
            )
            corrected_preds = corrected.tolist()
            after = _scorer.score(X_test, y_true, corrected_preds, sensitive_features)
            after_acc = round(float(np.mean(y_true_arr == corrected)), 3)

        else:
            raise ValueError(f"Unknown strategy '{strategy}'. Choose 'pre', 'in', or 'post'.")

        return {
            "strategy": strategy,
            "before": {
                "fair_score": before["fair_score"],
                "demographic_parity": before["demographic_parity"],
                "equalized_odds": before["equalized_odds"],
                "individual_fairness": before["individual_fairness"],
                "accuracy": before_acc,
            },
            "after": {
                "fair_score": after["fair_score"],
                "demographic_parity": after["demographic_parity"],
                "equalized_odds": after["equalized_odds"],
                "individual_fairness": after["individual_fairness"],
                "accuracy": after_acc,
            },
            "tradeoff": {
                "fairness_gain": round(after["fair_score"] - before["fair_score"], 1),
                "accuracy_loss": round((before_acc - after_acc) * 100, 1),
            },
            "corrected_predictions": corrected_preds,
            "sample_weights": sample_weights,
        }
