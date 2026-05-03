from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os, json, re

load_dotenv()
router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class DesignInput(BaseModel):
    problem: str
    requirements: str
    capacity: str
    high_level: str
    deep_dive: str
    tradeoffs: str

class FollowupInput(BaseModel):
    problem: str
    evaluation: dict

def extract_json(text: str):
    """Robustly extract the first valid JSON object or array from a string."""
    # Strip markdown fences
    text = re.sub(r"```(?:json)?", "", text).strip()
    # Find outermost { } or [ ]
    for start_char, end_char in [('{', '}'), ('[', ']')]:
        start = text.find(start_char)
        if start == -1:
            continue
        depth = 0
        for i, ch in enumerate(text[start:], start):
            if ch == start_char:
                depth += 1
            elif ch == end_char:
                depth -= 1
                if depth == 0:
                    return json.loads(text[start:i+1])
    raise ValueError(f"No valid JSON found in response: {text[:300]}")

SYSTEM_PROMPT = """You are a senior staff engineer conducting system design interviews.
You MUST respond with ONLY a valid JSON object — no markdown, no backticks, no explanation, no preamble.
The response must be parseable by Python's json.loads() directly."""

EVAL_PROMPT = """Evaluate this system design interview response for: {problem}

CANDIDATE'S DESIGN:
Requirements Clarification: {requirements}
Capacity Estimation: {capacity}
High-Level Design: {high_level}
Deep Dive (DB schema, APIs, components): {deep_dive}
Bottlenecks & Trade-offs: {tradeoffs}

Score each section 1-10 and write a 2-3 sentence comment. Give an overall band: Junior / Mid / Senior / Staff.

Return this exact JSON structure:
{{
  "scores": {{
    "requirements": {{"score": 7, "comment": "..."}},
    "capacity": {{"score": 6, "comment": "..."}},
    "high_level": {{"score": 8, "comment": "..."}},
    "deep_dive": {{"score": 5, "comment": "..."}},
    "tradeoffs": {{"score": 6, "comment": "..."}}
  }},
  "overall_score": 6.4,
  "band": "Mid",
  "summary": "2-3 sentence overall summary",
  "strengths": ["strength 1", "strength 2"],
  "gaps": ["gap 1", "gap 2"]
}}"""

FOLLOWUP_PROMPT = """You are a staff engineer interviewing a candidate about their {problem} design.

Evaluation summary: {summary}
Identified gaps: {gaps}

Generate exactly 3 probing follow-up questions targeting the weakest areas. Be specific and technical.

Return ONLY a JSON array of 3 strings:
["Question one?", "Question two?", "Question three?"]"""

@router.post("/evaluate")
async def evaluate_design(data: DesignInput):
    prompt = EVAL_PROMPT.format(
        problem=data.problem,
        requirements=data.requirements or "(not provided)",
        capacity=data.capacity or "(not provided)",
        high_level=data.high_level or "(not provided)",
        deep_dive=data.deep_dive or "(not provided)",
        tradeoffs=data.tradeoffs or "(not provided)",
    )
    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=1500,
        )
        raw = resp.choices[0].message.content.strip()
        return extract_json(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/followup")
async def get_followup(data: FollowupInput):
    prompt = FOLLOWUP_PROMPT.format(
        problem=data.problem,
        summary=data.evaluation.get("summary", ""),
        gaps=data.evaluation.get("gaps", []),
    )
    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=500,
        )
        raw = resp.choices[0].message.content.strip()
        questions = extract_json(raw)
        return {"questions": questions if isinstance(questions, list) else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))