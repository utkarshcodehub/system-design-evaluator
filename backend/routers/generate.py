from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os, json, re

load_dotenv()
router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class IdeaInput(BaseModel):
    idea: str

def extract_json(text: str):
    # Strip markdown fences
    text = re.sub(r"```(?:json)?", "", text).strip()

    # Find outermost { }
    start = text.find('{')
    if start == -1:
        raise ValueError("No JSON object found in response")
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                raw = text[start:i+1]
                # Replace literal control characters inside JSON strings
                # LLMs sometimes emit raw \n inside string values instead of \\n
                sanitized = re.sub(
                    r'"((?:[^"\\]|\\.)*)"',
                    lambda m: '"' + m.group(1)
                        .replace('\n', '\\n')
                        .replace('\r', '\\r')
                        .replace('\t', '\\t')
                    + '"',
                    raw,
                    flags=re.DOTALL
                )
                return json.loads(sanitized)
    raise ValueError("Unclosed JSON object in response")

SYSTEM_PROMPT = """You are a senior staff engineer and system design expert.
You MUST respond with ONLY a valid JSON object.
CRITICAL RULES for the JSON:
- No markdown, no backticks, no text before or after the JSON
- All string values must use \\n for newlines, never literal newlines inside strings
- The response must be parseable by Python's json.loads() directly"""

GENERATE_PROMPT = """A user has described a project idea. Generate a thorough, senior-level system design.

Project idea: {idea}

Return this exact JSON with detailed content in each field. Each field value must be a single string with \\n used for line breaks (never literal newlines):
{{
  "title": "short descriptive title for this system design",
  "requirements": "FUNCTIONAL REQUIREMENTS:\\n- [requirement 1]\\n- [requirement 2]\\n\\nNON-FUNCTIONAL REQUIREMENTS:\\n- Scale: [target]\\n- Latency: [SLA]\\n- Availability: [target]\\n\\nOUT OF SCOPE:\\n- [item]",
  "capacity": "ASSUMPTIONS:\\n- DAU: [number]\\n- Read/Write ratio: [ratio]\\n\\nESTIMATES:\\n- Read QPS: [number]\\n- Write QPS: [number]\\n- Storage per day: [size]\\n- Total storage (3 years): [size]\\n- Bandwidth: [size]/s",
  "high_level": "COMPONENTS:\\n- [component 1]: [purpose]\\n- [component 2]: [purpose]\\n\\nDATA FLOW:\\n[step 1] -> [step 2] -> [step 3]\\n\\nARCHITECTURE:\\n[describe the architecture clearly]",
  "deep_dive": "DB SCHEMA:\\n[key tables and fields]\\n\\nCORE APIs:\\n- [METHOD] /[path]: [description]\\n\\nKEY ALGORITHMS:\\n[algorithm details]\\n\\nCOMPONENT INTERNALS:\\n[specific internals worth calling out]",
  "tradeoffs": "BOTTLENECKS & MITIGATIONS:\\n- [bottleneck]: [mitigation]\\n\\nCONSISTENCY vs AVAILABILITY:\\n[trade-off made and why]\\n\\nDESIGN DECISIONS:\\n- [decision]: [rationale]\\n\\nALTERNATIVES REJECTED:\\n- [alternative]: [reason rejected]"
}}"""

@router.post("/generate")
async def generate_design(data: IdeaInput):
    if not data.idea.strip():
        raise HTTPException(status_code=400, detail="Project idea cannot be empty")

    prompt = GENERATE_PROMPT.format(idea=data.idea.strip())
    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.2,
            max_tokens=3000,
        )
        raw = resp.choices[0].message.content.strip()
        return extract_json(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))