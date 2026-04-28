import os
from dotenv import load_dotenv

load_dotenv()

_FALLBACK = (
    "This decision was influenced by multiple factors in your profile. "
    "To improve your outcome, consider addressing the highest-impact factors identified above."
)


def call_groq(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return _FALLBACK
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return _FALLBACK
