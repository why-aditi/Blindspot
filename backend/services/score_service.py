from typing import Dict, Any, List

from modules.score.scorer import FairScorer

_scorer = FairScorer()


class ScoreService:
    def calculate_fair_score(self, X_test: List[List[float]], y_true: List[int],
                             y_pred: List[int], sensitive_features: List[int]) -> Dict[str, Any]:
        return _scorer.score(X_test, y_true, y_pred, sensitive_features)
