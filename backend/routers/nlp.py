from fastapi import APIRouter
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from controllers.nlp_controller import NLPController, NLPRequest

router = APIRouter(prefix="/nlp-scan", tags=["nlp"])
nlp_controller = NLPController()


@router.post("/")
async def scan_text(request: NLPRequest):
    """
    Scan text for biased language across four categories:
    gender-coded, age bias, caste signals (India-specific), and socioeconomic markers.

    Returns flagged words with severity, a BERT-based bias score, and an LLM-generated neutral rewrite.
    """
    return await nlp_controller.handle_scan(request)
