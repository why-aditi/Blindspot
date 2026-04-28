from modules.nlp.scanner import NLPScanner

_scanner = NLPScanner()


class NLPService:
    def run_scan(self, text: str) -> dict:
        return _scanner.scan(text)
