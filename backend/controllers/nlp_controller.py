from fastapi import HTTPException
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.nlp_service import NLPService


class NLPRequest(BaseModel):
    text: str


class NLPController:
    def __init__(self):
        self.nlp_service = NLPService()

    async def handle_scan(self, request: NLPRequest):
        try:
            if not request.text.strip():
                raise HTTPException(status_code=400, detail="Text cannot be empty")
            result = self.nlp_service.run_scan(request.text)
            return {"status": "ok", "result": result}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"NLP scan failed: {str(e)}")
