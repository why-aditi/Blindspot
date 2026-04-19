import pandas as pd
import numpy as np
from typing import List, Dict, Any


class BiasAuditor:
    def run(self, df: pd.DataFrame, protected_cols: List[str], label_col: str) -> Dict[str, Any]:
        """
        Run bias audit on a dataset.
        
        Args:
            df: Input DataFrame
            protected_cols: List of protected attribute columns
            label_col: Name of the label/outcome column
            
        Returns:
            Dictionary containing bias analysis results
        """
        results = {}
        
        # 1. Representation check per protected column
        for col in protected_cols:
            if col not in df.columns:
                results[col] = {'error': f'Column {col} not found in dataset'}
                continue
                
            dist = df[col].value_counts(normalize=True)
            results[col] = {
                'distribution': dist.to_dict(),
                'imbalance_score': float(dist.max() - dist.min())
            }
        
        # 2. Correlation-based proxy variable detection (simpler than mutual info)
        if label_col in df.columns:
            X = df.drop(columns=[label_col])
            y = df[label_col]
            
            # Convert categorical to numeric for correlation
            X_encoded = X.copy()
            for col in X.columns:
                if X[col].dtype == 'object':
                    X_encoded[col] = pd.factorize(X[col])[0]
            
            # Convert label to numeric if needed
            if y.dtype == 'object':
                y = pd.factorize(y)[0]
            
            try:
                # Calculate point-biserial correlation for each feature with label
                correlations = {}
                for col in X_encoded.columns:
                    corr = abs(X_encoded[col].corr(pd.Series(y)))
                    correlations[col] = float(corr)
                results['proxy_risks'] = correlations
            except Exception as e:
                results['proxy_risks'] = {'error': str(e)}
        else:
            results['proxy_risks'] = {'error': f'Label column {label_col} not found'}
        
        # 3. Label distribution per group
        if label_col in df.columns:
            for col in protected_cols:
                if col in df.columns:
                    # Convert label to numeric for mean calculation
                    label_series = df[label_col]
                    if label_series.dtype == 'object':
                        label_series = pd.factorize(label_series)[0]
                    label_dist = df.groupby(col)[label_series].mean()
                    results[f'label_skew_{col}'] = label_dist.to_dict()
        
        return results
