from typing import List, Dict
from modules.explain.groq_client import call_groq

_nlp = None
_bert = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("en_core_web_sm")
        except Exception:
            _nlp = False  # mark as unavailable
    return _nlp if _nlp is not False else None


def _get_bert():
    global _bert
    if _bert is None:
        try:
            from transformers import pipeline
            _bert = pipeline("text-classification", model="d4data/bias-detection-model", top_k=None)
        except Exception:
            _bert = False
    return _bert if _bert is not False else None


class NLPScanner:
    GENDERED = {
        'aggressive', 'rockstar', 'ninja', 'nurturing', 'supportive',
        'assertive', 'dominant', 'gentle', 'collaborative', 'competitive',
        'independent', 'empathetic', 'driven', 'passionate',
    }
    AGE_BIAS = {
        'young', 'dynamic', 'energetic', 'youthful', 'seasoned', 'mature',
        'digital native', 'fresh graduate', 'recent graduate', 'experienced professional',
    }
    CASTE = {
        'brahmin', 'gotra',
        'community preference', 'own community', 'caste preference',
        'same community', 'community based',
    }
    SOCIOECONOMIC = {
        'ivy league', 'iit', 'iim', 'elite', 'pedigree',
        'premium college', 'unpaid internship', 'own laptop required',
    }

    _SEVERITY = {'gender': 'medium', 'age': 'high', 'caste': 'critical', 'socioeconomic': 'medium'}
    _CATEGORIES = [
        ('gender', GENDERED), ('age', AGE_BIAS), ('caste', CASTE), ('socioeconomic', SOCIOECONOMIC)
    ]

    def scan(self, text: str) -> dict:
        flags = self._rule_scan(text)
        bias_score = self._bert_score(text)
        rewrite = self._get_rewrite(text, flags)
        return {
            "flags": flags,
            "bias_score": round(bias_score, 3),
            "flag_count": len(flags),
            "categories": list({f["type"] for f in flags}),
            "rewrite": rewrite,
        }

    def _rule_scan(self, text: str) -> List[Dict]:
        lower = text.lower()
        seen: set = set()
        flags: List[Dict] = []

        for cat_name, word_set in self._CATEGORIES:
            severity = self._SEVERITY[cat_name]
            for phrase in sorted(word_set, key=len, reverse=True):
                if phrase in lower and phrase not in seen:
                    seen.add(phrase)
                    flags.append({"word": phrase, "type": cat_name, "severity": severity})

        return flags

    def _bert_score(self, text: str) -> float:
        bert = _get_bert()
        if bert is None:
            return 0.0
        try:
            results = bert(text[:512])
            # results can be list[list[dict]] or list[dict] depending on top_k
            items = results[0] if isinstance(results[0], list) else results
            for item in items:
                if item["label"].upper() in ("BIASED", "LABEL_1", "1"):
                    return float(item["score"])
            return 0.0
        except Exception:
            return 0.0

    def _get_rewrite(self, text: str, flags: List[Dict]) -> str:
        if not flags:
            return call_groq(
                f"This text appears relatively bias-free. Confirm briefly and suggest one optional improvement: {text[:300]}"
            )
        flagged_words = [f["word"] for f in flags]
        return call_groq(
            f"Rewrite the following text to remove bias. "
            f"Replace or remove these biased words/phrases: {flagged_words}. "
            f"Return only the rewritten text, no explanation. "
            f"Original: {text[:500]}"
        )
