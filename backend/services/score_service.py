import numpy as np
from typing import Dict, Any, List


class ScoreService:
    def calculate_fair_score(self, X_test: List[List[float]], y_true: List[int], 
                            y_pred: List[int], sensitive_features: List[int]) -> Dict[str, Any]:
        """
        Calculate fairness score for a model.
        
        Args:
            X_test: Test features
            y_true: True labels
            y_pred: Predicted labels
            sensitive_features: Sensitive attribute values (e.g., 0/1 for binary)
            
        Returns:
            Dictionary with overall fair_score and component metrics
        """
        try:
            X_test = np.array(X_test)
            y_true = np.array(y_true)
            y_pred = np.array(y_pred)
            sensitive_features = np.array(sensitive_features)
            
            # 1. Demographic Parity (40% weight)
            dp = self._calculate_demographic_parity(y_pred, sensitive_features)
            
            # 2. Equalized Odds (40% weight)
            eo = self._calculate_equalized_odds(y_true, y_pred, sensitive_features)
            
            # 3. Individual Fairness via nearest-neighbor consistency (20% weight)
            consistency = self._calculate_individual_fairness(X_test, y_pred)
            
            # Calculate weighted fair score
            fair_score = round((dp * 0.4 + eo * 0.4 + consistency * 0.2) * 100, 1)
            
            return {
                'fair_score': fair_score,
                'demographic_parity': round(dp, 3),
                'equalized_odds': round(eo, 3),
                'individual_fairness': round(consistency, 3)
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'fair_score': 0.0,
                'demographic_parity': 0.0,
                'equalized_odds': 0.0,
                'individual_fairness': 0.0
            }
    
    def _calculate_demographic_parity(self, y_pred: np.ndarray, 
                                      sensitive_features: np.ndarray) -> float:
        """Calculate demographic parity: 1 - difference in positive prediction rates"""
        unique_groups = np.unique(sensitive_features)
        if len(unique_groups) < 2:
            return 1.0
        
        group_rates = []
        for group in unique_groups:
            mask = sensitive_features == group
            rate = np.mean(y_pred[mask])
            group_rates.append(rate)
        
        diff = abs(max(group_rates) - min(group_rates))
        return 1 - diff
    
    def _calculate_equalized_odds(self, y_true: np.ndarray, y_pred: np.ndarray,
                                  sensitive_features: np.ndarray) -> float:
        """Calculate equalized odds: average of TPR and FPR differences"""
        unique_groups = np.unique(sensitive_features)
        if len(unique_groups) < 2:
            return 1.0
        
        # Calculate TPR and FPR for each group
        tpr_rates = []
        fpr_rates = []
        
        for group in unique_groups:
            mask = sensitive_features == group
            group_y_true = y_true[mask]
            group_y_pred = y_pred[mask]
            
            # True Positive Rate
            true_positives = np.sum((group_y_true == 1) & (group_y_pred == 1))
            actual_positives = np.sum(group_y_true == 1)
            tpr = true_positives / actual_positives if actual_positives > 0 else 0
            tpr_rates.append(tpr)
            
            # False Positive Rate
            false_positives = np.sum((group_y_true == 0) & (group_y_pred == 1))
            actual_negatives = np.sum(group_y_true == 0)
            fpr = false_positives / actual_negatives if actual_negatives > 0 else 0
            fpr_rates.append(fpr)
        
        tpr_diff = abs(max(tpr_rates) - min(tpr_rates))
        fpr_diff = abs(max(fpr_rates) - min(fpr_rates))
        
        # Average of the two differences
        avg_diff = (tpr_diff + fpr_diff) / 2
        return 1 - avg_diff
    
    def _calculate_individual_fairness(self, X: np.ndarray, y_pred: np.ndarray, 
                                       n_neighbors: int = 5) -> float:
        """
        Calculate individual fairness using nearest-neighbor consistency.
        
        Args:
            X: Feature matrix
            y_pred: Predictions
            n_neighbors: Number of neighbors to consider
            
        Returns:
            Consistency score (0-1)
        """
        try:
            # Calculate pairwise distances
            n = len(X)
            if n < 2:
                return 1.0
            
            # Find n nearest neighbors for each point using Euclidean distance
            distances = np.zeros((n, n))
            for i in range(n):
                for j in range(n):
                    if i != j:
                        distances[i, j] = np.linalg.norm(X[i] - X[j])
            
            total_consistency = 0.0
            count = 0
            
            for i in range(n):
                # Get indices of n nearest neighbors (excluding self)
                neighbor_indices = np.argsort(distances[i])[:n_neighbors]
                
                for j in neighbor_indices:
                    if i != j:
                        consistency = 1 - abs(y_pred[i] - y_pred[j])
                        total_consistency += consistency
                        count += 1
            
            if count == 0:
                return 1.0
                
            return total_consistency / count
            
        except Exception:
            return 1.0
