from fastapi import UploadFile, Form, HTTPException
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.monitor_service import MonitorService


class MonitorController:
    def __init__(self):
        self.monitor_service = MonitorService()

    async def handle_monitor(
        self,
        reference_file: UploadFile,
        current_file: UploadFile,
        target_col: str,
        pred_col: str,
    ):
        try:
            reference_bytes = await reference_file.read()
            current_bytes = await current_file.read()
            result = self.monitor_service.run_monitor(
                reference_bytes, current_bytes, target_col.strip(), pred_col.strip()
            )
            return {"status": "ok", "report": result}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Monitoring failed: {str(e)}")
