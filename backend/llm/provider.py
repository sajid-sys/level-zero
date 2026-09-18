import json
import re
import logging
import httpx
from typing import List, Dict, Any, Optional
from backend.config import GEMINI_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY, OPENROUTER_MODEL, LLM_PROVIDER
from backend.llm.prompts import SYSTEM_PROMPT

logger = logging.getLogger("gridwise.llm")


async def call_llm(operator_notes: List[str], timeout_seconds: float = 12.0) -> Optional[List[Dict[str, Any]]]:
    """
    Sends all operator notes to the configured LLM in a single request.
    Supports OpenRouter, Gemini REST API, or OpenAI-compatible API.
    Returns parsed JSON list if successful, None if unavailable or failed.
    """
    prompt_text = "Analyze these operator notes:\n"
    for i, note in enumerate(operator_notes):
        prompt_text += f"Note {i}: \"{note}\"\n"

    # 1. Try OpenRouter if API key is provided
    if OPENROUTER_API_KEY and LLM_PROVIDER in ("auto", "openrouter"):
        try:
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "GridWise",
                "Content-Type": "application/json"
            }
            payload = {
                "model": OPENROUTER_MODEL or "google/gemini-2.5-flash",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt_text}
                ],
                "temperature": 0.0,
                "max_tokens": 1000
            }
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    if content.startswith("```"):
                        content = re.sub(r"^```(?:json)?\s*", "", content)
                        content = re.sub(r"\s*```$", "", content)
                    parsed = json.loads(content)
                    if isinstance(parsed, list):
                        logger.info(f"OpenRouter ({payload['model']}) successfully parsed {len(parsed)} notes.")
                        return parsed
                    if isinstance(parsed, dict) and "directives" in parsed:
                        return parsed["directives"]
                else:
                    logger.warning(f"OpenRouter returned HTTP {res.status_code}: {res.text[:200]}")
        except Exception as e:
            logger.warning(f"OpenRouter call failed: {e}")

    # 2. Try Gemini direct if API key is provided
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

    # 3. Try OpenAI direct if API key is provided
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
