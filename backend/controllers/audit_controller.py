from fastapi import UploadFile, Form, HTTPException
from typing import List
import sys
import os

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.audit_service import AuditService


class AuditController:
    def __init__(self):
        self.audit_service = AuditService()
    
    async def handle_audit(self, file: UploadFile, protected_cols: str, label_col: str):
        """
        Handle audit request - controller layer that orchestrates the service call
        
        Args:
            file: Uploaded file
            protected_cols: Comma-separated list of protected columns
            label_col: Label column name
            
        Returns:
            Audit results
        """
        try:
            # Parse protected columns
            protected_cols_list = [col.strip() for col in protected_cols.split(',')]
            
            # Read file content
            file_content = await file.read()
            
            # Call service layer
            report = self.audit_service.run_audit(
                file_content, 
                file.filename or "unknown",
                protected_cols_list, 
                label_col
            )
            
            return {
                "status": "ok",
                "report": report
            }
            
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")
