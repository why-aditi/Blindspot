import io
import pandas as pd
from modules.monitor.monitor import FairnessMonitor

_monitor = FairnessMonitor()


class MonitorService:
    def run_monitor(
        self,
        reference_bytes: bytes,
        current_bytes: bytes,
        target_col: str,
        pred_col: str,
    ) -> dict:
        reference_df = pd.read_csv(io.BytesIO(reference_bytes))
        current_df = pd.read_csv(io.BytesIO(current_bytes))
        return _monitor.generate_report(reference_df, current_df, target_col, pred_col)
