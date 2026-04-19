from fastapi import APIRouter, UploadFile, File, Form
import sys
import os

# Add parent directory to path to import controllers
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from controllers.audit_controller import AuditController

router = APIRouter(prefix="/audit", tags=["audit"])
audit_controller = AuditController()


@router.post("/")
async def audit_dataset(
    file: UploadFile = File(...),
    protected_cols: str = Form(...),
    label_col: str = Form(...)
):
    """
    Audit a dataset for bias.
    
    Args:
        file: CSV or JSON file upload
        protected_cols: Comma-separated list of protected attribute columns
        label_col: Name of the label/outcome column
        
    Returns:
        Bias audit report with distribution, imbalance scores, proxy risks, and label skew
    """
    return await audit_controller.handle_audit(file, protected_cols, label_col)
