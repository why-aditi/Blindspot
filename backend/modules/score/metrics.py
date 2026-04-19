import numpy as np
from typing import Dict, Any


def calculate_statistical_parity(y_true: np.ndarray, y_pred: np.ndarray, 
                                  sensitive_features: np.ndarray) -> Dict[str, float]:
    """
    Calculate statistical parity difference between groups.
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        sensitive_features: Sensitive attribute values
        
    Returns:
        Dictionary with statistical parity metrics
    """
    unique_groups = np.unique(sensitive_features)
    group_rates = {}
    
    for group in unique_groups:
        mask = sensitive_features == group
        group_rates[group] = np.mean(y_pred[mask])
    
    if len(group_rates) < 2:
        return {'error': 'Need at least 2 groups to calculate parity'}
    
    rates = list(group_rates.values())
    max_rate = max(rates)
    min_rate = min(rates)
    
    return {
        'group_rates': group_rates,
        'difference': max_rate - min_rate,
        'ratio': max_rate / min_rate if min_rate > 0 else float('inf')
    }


def calculate_predictive_parity(y_true: np.ndarray, y_pred: np.ndarray,
                                  sensitive_features: np.ndarray) -> Dict[str, float]:
    """
    Calculate predictive parity (precision) per group.
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        sensitive_features: Sensitive attribute values
        
    Returns:
        Dictionary with predictive parity metrics
    """
    unique_groups = np.unique(sensitive_features)
    group_precisions = {}
    
    for group in unique_groups:
        mask = sensitive_features == group
        group_y_pred = y_pred[mask]
        group_y_true = y_true[mask]
        
        # Only calculate precision for positive predictions
        positive_mask = group_y_pred == 1
        if np.sum(positive_mask) > 0:
            precision = np.mean(group_y_true[positive_mask] == 1)
            group_precisions[group] = precision
        else:
            group_precisions[group] = 0.0
    
    if len(group_precisions) < 2:
        return {'error': 'Need at least 2 groups with positive predictions'}
    
    precisions = list(group_precisions.values())
    max_prec = max(precisions)
    min_prec = min(precisions)
    
    return {
        'group_precisions': group_precisions,
        'difference': max_prec - min_prec,
        'ratio': max_prec / min_prec if min_prec > 0 else float('inf')
    }
