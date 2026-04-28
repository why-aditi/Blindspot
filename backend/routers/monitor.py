from fastapi import APIRouter, UploadFile, File, Form
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from controllers.monitor_controller import MonitorController

router = APIRouter(prefix="/monitor", tags=["monitor"])
monitor_controller = MonitorController()


@router.post("/")
async def generate_monitor_report(
    reference_file: UploadFile = File(...),
    current_file: UploadFile = File(...),
    target_col: str = Form(...),
    pred_col: str = Form(...),
):
    """
    Generate an Evidently AI data drift + classification report.
    Compares reference (training) data against current (live) data.
    Alerts via Supabase if dataset drift is detected.

    Args:
        reference_file: CSV of reference/training predictions
        current_file: CSV of current/live predictions
        target_col: Name of the ground-truth label column
        pred_col: Name of the prediction column
    """
    return await monitor_controller.handle_monitor(
        reference_file, current_file, target_col, pred_col
    )
