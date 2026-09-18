import json
import httpx
from typing import List, Dict, Any, Optional
from backend.config import GEMINI_API_KEY, OPENAI_API_KEY, LLM_PROVIDER
from backend.llm.prompts import SYSTEM_PROMPT


async def call_llm(operator_notes: List[str], timeout_seconds: float = 8.0) -> Optional[List[Dict[str, Any]]]:
    """
    Sends all operator notes to the configured LLM in a single request.
    Supports Gemini REST API or OpenAI-compatible API.
    Returns parsed JSON list if successful, None if unavailable or failed.
    """
    prompt_text = "Analyze these operator notes:\n"
    for i, note in enumerate(operator_notes):
        prompt_text += f"Note {i}: \"{note}\"\n"

    # Try Gemini if API key is provided
    if GEMINI_API_KEY and LLM_PROVIDER in ("auto", "gemini"):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": SYSTEM_PROMPT + "\n\n" + prompt_text}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.0,
                    "responseMimeType": "application/json"
                }
            }
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidate = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(candidate)
                    if isinstance(parsed, list):
                        return parsed
        except Exception:
            pass

    # Try OpenAI if API key is provided
    if OPENAI_API_KEY and LLM_PROVIDER in ("auto", "openai"):
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt_text}
                ],
                "temperature": 0.0,
                "response_format": {"type": "json_object"}
            }
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    if isinstance(parsed, list):
                        return parsed
                    if isinstance(parsed, dict) and "directives" in parsed:
                        return parsed["directives"]
        except Exception:
            pass

    return None
