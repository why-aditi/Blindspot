import numpy as np
from scipy.spatial.distance import cdist
from typing import Dict, Any, List

from modules.score.metrics import calculate_statistical_parity, calculate_predictive_parity


class FairScorer:
    # Weights: EO is the stronger metric (catches both TPR and FPR disparity),
    # so it gets more weight than DP which can be gamed by uniform predictions.
    _W_DP = 0.30
    _W_EO = 0.50
    _W_IF = 0.20

    def score(self, X_test: List[List[float]], y_true: List[int], y_pred: List[int],
              sensitive_features: List[int]) -> Dict[str, Any]:
        X = np.array(X_test, dtype=float)
        yt = np.array(y_true, dtype=int)
        yp = np.array(y_pred, dtype=int)
        sf = np.array(sensitive_features)

        dp = self._demographic_parity(yp, sf)
        eo = self._equalized_odds(yt, yp, sf)
        if_score = self._individual_fairness(X, yp)

        fair_score = round((dp * self._W_DP + eo * self._W_EO + if_score * self._W_IF) * 100, 1)

        stat_parity = calculate_statistical_parity(yt, yp, sf)
        pred_parity = calculate_predictive_parity(yt, yp, sf)

        return {
            'fair_score': fair_score,
            'demographic_parity': round(dp, 3),
            'equalized_odds': round(eo, 3),
            'individual_fairness': round(if_score, 3),
            'group_details': {
                'statistical_parity': stat_parity,
                'predictive_parity': pred_parity,
            },
        }

    def _demographic_parity(self, y_pred: np.ndarray, sf: np.ndarray) -> float:
        groups = np.unique(sf)
        if len(groups) < 2:
            return 1.0
        rates = [np.mean(y_pred[sf == g]) for g in groups]
        return max(0.0, 1.0 - (max(rates) - min(rates)))

    def _equalized_odds(self, y_true: np.ndarray, y_pred: np.ndarray, sf: np.ndarray) -> float:
        groups = np.unique(sf)
        if len(groups) < 2:
            return 1.0

        tprs, fprs = [], []
        for g in groups:
            mask = sf == g
            yt, yp = y_true[mask], y_pred[mask]

            pos = np.sum(yt == 1)
            neg = np.sum(yt == 0)
            tprs.append(np.sum((yt == 1) & (yp == 1)) / pos if pos > 0 else 0.0)
            fprs.append(np.sum((yt == 0) & (yp == 1)) / neg if neg > 0 else 0.0)

        tpr_diff = max(tprs) - min(tprs)
        fpr_diff = max(fprs) - min(fprs)
        return max(0.0, 1.0 - (tpr_diff + fpr_diff) / 2)

    def _individual_fairness(self, X: np.ndarray, y_pred: np.ndarray, n_neighbors: int = 5) -> float:
        n = len(X)
        if n < 2:
            return 1.0

        actual_k = min(n_neighbors, n - 1)
        distances = cdist(X, X, metric='euclidean')
        # Skip index 0 (self, always distance=0) by slicing from 1
        neighbor_idx = np.argsort(distances, axis=1)[:, 1:actual_k + 1]

        neighbor_preds = y_pred[neighbor_idx]           # (n, k)
        point_preds = y_pred[:, np.newaxis]             # (n, 1)
        return float(np.mean(1 - np.abs(point_preds - neighbor_preds)))
