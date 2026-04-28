import numpy as np
from typing import Optional


class BiasCorrector:
    def post_process(
        self, y_pred: np.ndarray, y_true: np.ndarray, sensitive_features: np.ndarray
    ) -> np.ndarray:
        """Equalize positive-prediction rates across groups by flipping borderline predictions."""
        groups = np.unique(sensitive_features)
        overall_rate = float(np.mean(y_pred))
        corrected = y_pred.copy()
        rng = np.random.default_rng(42)

        for g in groups:
            mask = sensitive_features == g
            n_group = int(np.sum(mask))
            current_rate = float(np.mean(corrected[mask]))
            delta = current_rate - overall_rate

            if delta > 0.01:
                ones_idx = np.where(mask & (corrected == 1))[0]
                n_flip = min(max(0, int(round(delta * n_group))), len(ones_idx))
                if n_flip:
                    corrected[rng.choice(ones_idx, n_flip, replace=False)] = 0
            elif delta < -0.01:
                zeros_idx = np.where(mask & (corrected == 0))[0]
                n_flip = min(max(0, int(round(-delta * n_group))), len(zeros_idx))
                if n_flip:
                    corrected[rng.choice(zeros_idx, n_flip, replace=False)] = 1

        return corrected

    def pre_process(
        self, y_train: np.ndarray, sensitive_features: np.ndarray
    ) -> np.ndarray:
        """Compute reweighing sample weights using the AIF360 formula: weight = P(Y)*P(S) / P(Y,S)."""
        n = len(y_train)
        weights = np.ones(n, dtype=float)

        for s in np.unique(sensitive_features):
            for y in np.unique(y_train):
                mask = (sensitive_features == s) & (y_train == y)
                p_s = float(np.mean(sensitive_features == s))
                p_y = float(np.mean(y_train == y))
                p_sy = float(np.mean(mask))
                if p_sy > 0:
                    weights[mask] = (p_s * p_y) / p_sy

        return weights

    def in_process(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        sensitive_train: np.ndarray,
        X_test: np.ndarray,
    ) -> np.ndarray:
        """Retrain with demographic parity constraints via Fairlearn ExponentiatedGradient."""
        try:
            from fairlearn.reductions import ExponentiatedGradient, DemographicParity
            from sklearn.tree import DecisionTreeClassifier
        except ImportError as e:
            raise RuntimeError(f"fairlearn/scikit-learn not installed: {e}")

        base = DecisionTreeClassifier(max_depth=5, random_state=42)
        mitigator = ExponentiatedGradient(base, DemographicParity())
        mitigator.fit(X_train, y_train, sensitive_features=sensitive_train)
        return mitigator.predict(X_test)
