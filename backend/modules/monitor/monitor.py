import os
import pandas as pd

REPORTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "reports")


class FairnessMonitor:
    def generate_report(
        self,
        reference_df: pd.DataFrame,
        current_df: pd.DataFrame,
        target_col: str,
        pred_col: str,
    ) -> dict:
        try:
            from evidently.report import Report
            from evidently.metric_preset import DataDriftPreset, ClassificationPreset
            from evidently import ColumnMapping

            os.makedirs(REPORTS_DIR, exist_ok=True)
            report_path = os.path.join(REPORTS_DIR, "latest.html")

            col_map = ColumnMapping(target=target_col, prediction=pred_col)
            report = Report(metrics=[DataDriftPreset(), ClassificationPreset()])
            report.run(reference_data=reference_df, current_data=current_df, column_mapping=col_map)
            report.save_html(report_path)

            report_dict = report.as_dict()
            drift_result = report_dict["metrics"][0]["result"]
            drift_detected = drift_result.get("dataset_drift", False)

            if drift_detected:
                self._send_alert()

            return {
                "drift_detected": drift_detected,
                "drift_share": round(drift_result.get("drift_share", 0), 3),
                "n_drifted_features": drift_result.get("number_of_drifted_columns", 0),
                "report_available": True,
            }

        except ImportError:
            return self._ks_drift(reference_df, current_df, target_col, pred_col)

    def _ks_drift(
        self,
        reference_df: pd.DataFrame,
        current_df: pd.DataFrame,
        target_col: str,
        pred_col: str,
    ) -> dict:
        from scipy.stats import ks_2samp

        skip = {target_col, pred_col}
        numeric_cols = [
            c for c in reference_df.columns
            if c not in skip and pd.api.types.is_numeric_dtype(reference_df[c])
        ]

        if not numeric_cols:
            return {
                "drift_detected": False,
                "drift_share": 0.0,
                "n_drifted_features": 0,
                "report_available": False,
                "error": "No numeric feature columns found for drift detection",
            }

        n_drifted = sum(
            1 for col in numeric_cols
            if ks_2samp(reference_df[col].dropna(), current_df[col].dropna()).pvalue < 0.05
        )
        drift_share = n_drifted / len(numeric_cols)

        result = {
            "drift_detected": drift_share > 0.5,
            "drift_share": round(drift_share, 3),
            "n_drifted_features": n_drifted,
            "report_available": False,
        }

        if result["drift_detected"]:
            self._send_alert()

        return result

    def _send_alert(self):
        try:
            from db.supabase_client import supabase
            supabase.table("alerts").insert(
                {"type": "drift", "severity": "high", "message": "Data drift detected"}
            ).execute()
        except Exception:
            pass

    def store_fairness_record(self, fair_score: float, metrics: dict):
        try:
            from db.supabase_client import supabase
            supabase.table("fairness_history").insert({
                "fair_score": fair_score,
                "demographic_parity": metrics.get("demographic_parity"),
                "equalized_odds": metrics.get("equalized_odds"),
                "individual_fairness": metrics.get("individual_fairness"),
            }).execute()
        except Exception:
            pass
