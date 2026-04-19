import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency


def chi_square_test(df: pd.DataFrame, col: str, label_col: str) -> Dict[str, Any]:
    """
    Perform chi-square test for independence between a feature and label.
    
    Args:
        df: Input DataFrame
        col: Feature column name
        label_col: Label column name
        
    Returns:
        Dictionary with chi-square statistic and p-value
    """
    try:
        contingency_table = pd.crosstab(df[col], df[label_col])
        chi2, p_value, dof, expected = chi2_contingency(contingency_table)
        return {
            'chi2_statistic': float(chi2),
            'p_value': float(p_value),
            'degrees_of_freedom': int(dof),
            'is_significant': p_value < 0.05
        }
    except Exception as e:
        return {'error': str(e)}


def calculate_disparity_ratio(df: pd.DataFrame, col: str, label_col: str) -> Dict[str, float]:
    """
    Calculate disparity ratio between groups for a given feature.
    
    Args:
        df: Input DataFrame
        col: Feature column name
        label_col: Label column name
        
    Returns:
        Dictionary with disparity ratios between groups
    """
    try:
        group_means = df.groupby(col)[label_col].mean()
        max_mean = group_means.max()
        min_mean = group_means.min()
        
        if min_mean == 0:
            ratio = float('inf')
        else:
            ratio = max_mean / min_mean
            
        return {
            'disparity_ratio': ratio,
            'max_group_mean': float(max_mean),
            'min_group_mean': float(min_mean)
        }
    except Exception as e:
        return {'error': str(e)}
